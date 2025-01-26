import { TestBed } from '@angular/core/testing';
import { 
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';
import { 
  HttpTestingController, 
  provideHttpClientTesting 
} from '@angular/common/http/testing';
import { HomeService } from './home.service';


describe('HomeService Integration Tests', () => {
  let service: HomeService;
  let httpTestingController: HttpTestingController;
  const baseUrl = 'http://localhost:8080';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [HomeService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(HomeService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should retrieve user ID from session and handle errors', (done) => {
    service.getUserIdFromSession().subscribe(userId => {
      expect(userId).toBe(123);
      
      service.getUserIdFromSession().subscribe(errorId => {
        expect(errorId).toBe(-1);
        done();
      });
  
      const req2 = httpTestingController.expectOne(`${baseUrl}/user/sessionId`);
      req2.error(new ProgressEvent('network error'), {
        status: 0,
        statusText: 'Unknown Error'
      });
    });
  
    const req1 = httpTestingController.expectOne(`${baseUrl}/user/sessionId`);
    req1.flush({ userId: 123 });
  });

  
  it('should handle workout creation with proper payload', () => {
    const mockWorkout = { exercise: 'Squat', weight: 100, reps: 5 };
    
    service.saveWorkout(mockWorkout).subscribe();

    const req = httpTestingController.expectOne(`${baseUrl}/workout/save`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockWorkout);
    req.flush({ status: 'success' });
  });
});