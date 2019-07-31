import { Injectable } from '@angular/core';
import { InMemoryDbService, RequestInfo, STATUS, ResponseOptions, STATUS_CODE_INFO } from 'angular-in-memory-web-api';
import { ApplicationModel } from '../models/application-model';
import { JsonPipe } from '@angular/common';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class FakeDataService implements InMemoryDbService {

    private numberOfApplications = 87;

    private fakeData: ApplicationModel[];

    constructor() {
      this.fakeData = [];
      for (let i = 0; i < this.numberOfApplications; i++) {
        this.fakeData.push(ApplicationModel.randomize());
      }
    }

    createDb(reqInfo?: RequestInfo) {
     return { applications: {collection: this.fakeData, totalItems: this.fakeData.length } };
    }

    get(reqInfo: RequestInfo) {
      return this.getInternal(reqInfo);
    }

    private getInternal(reqInfo: RequestInfo) {
      return reqInfo.utils.createResponse$(() => {

        const pageSize = +(reqInfo.query.get('pageSize')[0]);
        const pageIndex = +(reqInfo.query.get('pageIndex')[0]);
        let data = null;
        if (pageSize === 0) {
          data = {collection: [], totalItems: this.fakeData.length };
        } else {
          const offset = pageSize * pageIndex;
          const dataCopy = this.fakeData.map(m => <ApplicationModel>JSON.parse(JSON.stringify(m)));
          const result = dataCopy.splice(offset, pageSize);
          data = {collection: result, totalItems: this.fakeData.length };
        }

        const options = {
          body: reqInfo.utils.getConfig().dataEncapsulation ? { data } : data,
          status: STATUS.OK,
        };

        return this.finishOptions(options, reqInfo);
      }).pipe(delay(100 + (Math.random() * 400)));
    }

    private finishOptions(options: ResponseOptions, {headers, url}: RequestInfo) {
      options.statusText = this.getStatusText(options.status);
      options.headers = headers;
      options.url = url;
      return options;
    }

    private getStatusText(status: number) {
      return STATUS_CODE_INFO[status].text || 'Unknown Status';
    }
}
