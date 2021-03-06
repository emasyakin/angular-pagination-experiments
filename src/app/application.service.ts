import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApplicationModel } from './models/application-model';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {

  constructor(private http: HttpClient) { }

  getApplications(pageIndex: number, pageSize: number, filter:object = null): Observable<{collection: ApplicationModel[], totalItems: number}> {
      return this.http.get<{collection: ApplicationModel[], totalItems: number}>
      ('api/applications', {
        params: new HttpParams()
                .set('filter', JSON.stringify(filter))
                .set('pageSize', pageSize.toString())
                .set('pageIndex', pageIndex.toString())
      });
  }
}
