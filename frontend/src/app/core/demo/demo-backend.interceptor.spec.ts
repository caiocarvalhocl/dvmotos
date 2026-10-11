import { TestBed } from "@angular/core/testing";
import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from "@angular/common/http";
import { environment } from "@env/environment";
import { demoBackendInterceptor } from "./demo-backend.interceptor";

describe("demoBackendInterceptor", () => {
  let http: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([demoBackendInterceptor]))],
    });
    http = TestBed.inject(HttpClient);
  });

  it("answers API calls from memory", (done) => {
    http
      .post<{ token: string }>(`${environment.apiUrl}/auth/login`, {
        email: "demo@dvmotos.com",
        password: "demo123",
      })
      .subscribe((res) => {
        expect(res.token).toContain("demo-token");
        done();
      });
  });

  it("maps backend errors to HttpErrorResponse", (done) => {
    http.get(`${environment.apiUrl}/clients`).subscribe({
      error: (err: HttpErrorResponse) => {
        expect(err.status).toBe(401);
        done();
      },
    });
  });

  it("passes query params to the backend", (done) => {
    http
      .get<{ content: unknown[] }>(`${environment.apiUrl}/clients`, {
        params: { page: "0", size: "2" },
        headers: { Authorization: "Bearer demo-token-1" },
      })
      .subscribe((page) => {
        expect(page.content.length).toBe(2);
        done();
      });
  });

  it("blocks requests that do not target the API", (done) => {
    http.get("https://example.com/data").subscribe({
      error: (err: HttpErrorResponse) => {
        expect(err.status).toBe(404);
        done();
      },
    });
  });
});
