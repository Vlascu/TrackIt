package servicetests;

import com.example.demo.model.entities.AppUser;
import com.example.demo.model.entities.WeightUpdate;
import com.example.demo.model.repos.UserRepository;
import com.example.demo.model.repos.WeightUpdateRepository;
import com.example.demo.model.service.UserService;
import com.example.demo.model.service.WeightUpdateService;
import org.apache.commons.codec.binary.Hex;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import jakarta.servlet.http.HttpSession;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private WeightUpdateRepository weightUpdateRepository;

    @Mock
    private WeightUpdateService weightUpdateService;

    @Mock
    private HttpSession session;

    @InjectMocks
    private UserService userService;

    @Nested
    class RegisterAndUpdateTests {
        @Test
        void registerAndUpdateWeight_missingFields_returnsBadRequest() {
            ResponseEntity<?> response = userService.registerAndUpdateWeight(null, "Doe", "pass", 70f, 175f, 30, session);
            assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        }

        @Test
        void registerAndUpdateWeight_userExists_returnsBadRequest() {
            when(userRepository.findUserByFirstNameAndLastName("John", "Doe"))
                    .thenReturn(Optional.of(new AppUser()));
            ResponseEntity<?> response = userService.registerAndUpdateWeight("John", "Doe", "pass", 70f, 175f, 30, session);
            assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
            assertEquals("User already exists", ((Map<?, ?>) response.getBody()).get("error"));
        }

        @Test
        void registerAndUpdateWeight_saveUserFails_returnsInternalError() {
            when(userRepository.findUserByFirstNameAndLastName(any(), any())).thenReturn(Optional.empty());
            when(userRepository.save(any())).thenThrow(new RuntimeException());
            ResponseEntity<?> response = userService.registerAndUpdateWeight("John", "Doe", "pass", 70f, 175f, 30, session);
            assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        }

        @Test
        void registerAndUpdateWeight_validUser_savesUserAndWeight() {
            AppUser savedUser = new AppUser("John", "Doe", "hash", 70f, 175f, 30);
            savedUser.setId(1L);
            when(userRepository.findUserByFirstNameAndLastName(any(), any())).thenReturn(Optional.empty());
            when(userRepository.save(any())).thenReturn(savedUser);

            ResponseEntity<?> response = userService.registerAndUpdateWeight("John", "Doe", "pass", 70f, 175f, 30, session);
            verify(weightUpdateRepository).save(any(WeightUpdate.class));
            verify(session).setAttribute("userId", 1L);
            assertEquals(HttpStatus.OK, response.getStatusCode());
        }
    }

    @Nested
    class GetLoggedUserTests {
        @Test
        void getLoggedUser_missingFields_returnsBadRequest() {
            ResponseEntity<?> response = userService.getLoggedUser(null, "Doe", "pass", session);
            assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        }

        @Test
        void getLoggedUser_validCredentials_setsSession() {
            AppUser user = new AppUser();
            user.setId(1L);
            when(userRepository.findUserByFirstNameAndLastNameAndPassword(any(), any(), any()))
                    .thenReturn(Optional.of(user));
            ResponseEntity<?> response = userService.getLoggedUser("John", "Doe", "pass", session);
            verify(session).setAttribute("userId", 1L);
            assertEquals(HttpStatus.OK, response.getStatusCode());
        }
    }

    @Nested
    class FindUserByIdTests {
        @Test
        void findUserById_noSessionUser_returnsNotFound() {
            when(session.getAttribute("userId")).thenReturn(null);
            ResponseEntity<?> response = userService.findUserById(session);
            assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        }

        @Test
        void findUserById_userNotFound_returnsNotFound() {
            when(session.getAttribute("userId")).thenReturn(1L);
            when(userRepository.findById(1L)).thenReturn(Optional.empty());
            ResponseEntity<?> response = userService.findUserById(session);
            assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        }

        @Test
        void findUserById_validUser_returnsUser() {
            AppUser user = new AppUser();
            user.setId(1L);
            when(session.getAttribute("userId")).thenReturn(1L);
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            ResponseEntity<?> response = userService.findUserById(session);
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertNotNull(((Map<?, ?>) response.getBody()).get("id"));
        }
    }

    @Nested
    class SaveNewWeightTests {
        @Test
        void saveNewWeight_noSessionUser_returnsNotFound() {
            when(session.getAttribute("userId")).thenReturn(null);
            ResponseEntity<?> response = userService.saveNewWeight(70f, "15-05-2023", session);
            assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        }

        @Test
        void saveNewWeight_userNotFound_returnsNotFound() {
            when(session.getAttribute("userId")).thenReturn(1L);
            when(userRepository.findById(1L)).thenReturn(Optional.empty());
            ResponseEntity<?> response = userService.saveNewWeight(70f, "15-05-2023", session);
            assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        }

        @Test
        void saveNewWeight_validRequest_updatesUserAndWeight() {
            when(session.getAttribute("userId")).thenReturn(1L);
            AppUser user = new AppUser();
            user.setId(1L);
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(userRepository.save(user)).thenReturn(user);
            WeightUpdate savedUpdate = new WeightUpdate();
            when(weightUpdateService.save(any())).thenReturn(Optional.of(savedUpdate));

            ResponseEntity<?> response = userService.saveNewWeight(70f, "15-05-2023", session);

            verify(weightUpdateService).save(argThat(update ->
                    update.getDay() == 15 &&
                            update.getMonth() == 5 &&
                            update.getYear() == 2023
            ));
            assertEquals(70f, user.getBodyWeight());
            assertEquals(HttpStatus.OK, response.getStatusCode());
        }
    }


    @Test
    void hashPassword_validInput_returnsCorrectHash() throws NoSuchAlgorithmException {
        String password = "password123";
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        byte[] expectedHash = md.digest(password.getBytes());
        String expectedHex = Hex.encodeHexString(expectedHash);
        assertEquals(expectedHex, UserService.hashPassword(password));
    }
}
