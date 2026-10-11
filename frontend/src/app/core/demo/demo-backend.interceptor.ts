import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpResponse,
} from "@angular/common/http";
import { Observable, delay, of, throwError } from "rxjs";
import { environment } from "@env/environment";
import { DemoBackend } from "./demo-backend";

const backend = new DemoBackend();
const LATENCY_MS = 150;

/**
 * Terminal interceptor for the public demo build: answers every request to the
 * API from memory instead of forwarding it to the network.
 */
export const demoBackendInterceptor: HttpInterceptorFn = (req) => {
  const apiRoot = environment.apiUrl;
  if (!req.url.startsWith(apiRoot)) {
    return throwError(
      () =>
        new HttpErrorResponse({
          url: req.url,
          status: 404,
          error: { message: "Demo: URL externa bloqueada" },
        }),
    );
  }

  const [path] = req.url.slice(apiRoot.length).split("?");
  const params: Record<string, string | undefined> = {};
  req.params.keys().forEach((key) => {
    params[key] = req.params.get(key) ?? undefined;
  });

  const result = backend.handle({
    method: req.method,
    path,
    params,
    body: req.body,
    authorization: req.headers.get("Authorization"),
  });

  const response: Observable<HttpResponse<unknown>> =
    result.status < 400
      ? of(
          new HttpResponse({
            url: req.url,
            status: result.status,
            body: result.body,
          }),
        )
      : throwError(
          () =>
            new HttpErrorResponse({
              url: req.url,
              status: result.status,
              error: result.body,
            }),
        );

  return response.pipe(delay(LATENCY_MS));
};
