import { DataSource } from '@angular/cdk/table';
import { ApplicationModel } from '../models/application-model';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { ApplicationService } from '../application.service';
import { CollectionViewer } from '@angular/cdk/collections';
import { catchError, finalize } from 'rxjs/operators';
import { timer } from 'rxjs';

export class ApplicationsDataSource implements DataSource<ApplicationModel> {

    private applicationsSubject = new BehaviorSubject<ApplicationModel[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);
    private totalItemsSubject = new BehaviorSubject<number>(0);

    public loading$ = this.loadingSubject;
    public totalItems$ = this.totalItemsSubject;

    constructor(private applicationService: ApplicationService) {
    }

    connect(collectionViewer: CollectionViewer): Observable<ApplicationModel[]> {
        return this.applicationsSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.applicationsSubject.complete();
        this.loadingSubject.complete();
    }

    loadApplications(pageIndex: number, pageSize: number, nameFilter = '') {
        this.loadingSubject.next(true);
        this.applicationService
            .getApplications(pageIndex, pageSize, nameFilter)
            .pipe(catchError(() => of({collection: [], totalItems: 0})),
                  finalize(() => {
                      this.loadingSubject.next(false);
                  })
        )
        .subscribe(applications => {
            this.applicationsSubject.next(applications.collection);
            this.totalItemsSubject.next(applications.totalItems);
        });
    }

    get data(): ApplicationModel[] {
        return this.applicationsSubject.value;
    }
}
