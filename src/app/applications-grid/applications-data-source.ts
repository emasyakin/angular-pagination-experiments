import { DataSource } from '@angular/cdk/table';
import { ApplicationModel } from '../models/application-model';
import { BehaviorSubject, Observable, of, Subject, Subscription, interval } from 'rxjs';
import { ApplicationService } from '../application.service';
import { CollectionViewer } from '@angular/cdk/collections';
import { catchError, finalize } from 'rxjs/operators';
import { timer } from 'rxjs';

export class ApplicationsDataSource implements DataSource<ApplicationModel> {

    private dataSubject = new BehaviorSubject<ApplicationModel[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);
    private totalItemsSubject = new BehaviorSubject<number>(0);
    private refreshSubscription: Subscription;

    public loading$ = this.loadingSubject;
    public totalItems$ = this.totalItemsSubject;

    constructor(private applicationService: ApplicationService,
                private timeoutMs: number,
                private pageIndex: number,
                private pageSize: number,
                private filter: object = null) {
    }

    connect(collectionViewer: CollectionViewer): Observable<ApplicationModel[]> {
      this.refreshSubscription = timer(0, this.timeoutMs)
                                .subscribe(() => { if (!this.loading$.value ) { this.load(); } });

      return this.dataSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.refreshSubscription.unsubscribe();
        this.dataSubject.complete();
        this.loadingSubject.complete();
    }

    changePaging(pageIndex: number, pageSize: number) {
      this.pageSize = pageSize;
      this.pageIndex = pageIndex;
      this.load();
    }

    load() {
        this.refreshSubscription.unsubscribe();
        //console.log('Request started at ' + new Date().toISOString());
        this.loadingSubject.next(true);
        this.applicationService
            .getApplications(this.pageIndex, this.pageSize, this.filter)
            .pipe(catchError(() => of({collection: [], totalItems: 0})),
                  finalize(() => {
                    this.loadingSubject.next(false);
                    //console.log('Request finished at ' + new Date().toISOString());
                    this.refreshSubscription = timer(this.timeoutMs, this.timeoutMs)
                    .subscribe(() => { if (!this.loading$.value ) { this.load(); } });
                  })
        )
        .subscribe(response => {
            this.dataSubject.next(response.collection);
            if (this.totalItemsSubject.value !== response.totalItems) {
              this.totalItemsSubject.next(response.totalItems);
            }
        });
    }

    get data(): ApplicationModel[] {
        return this.dataSubject.value;
    }
}
