import { DataSource } from '@angular/cdk/table';
import { ApplicationModel } from '../models/application-model';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { ApplicationService } from '../application.service';
import { CollectionViewer } from '@angular/cdk/collections';
import { catchError, finalize, switchMapTo, filter } from 'rxjs/operators';
import { timer } from 'rxjs';

export class PagedDataSource implements DataSource<ApplicationModel> {

    // Holds subscription object for polling timer
    private pollingSubscription: Subscription;

    /*
      Externally accessible data is published via BehaviorSubject.
      BehaviorSubject combines current value with Subscription to updates. <3
    */

    // provides current dataset (a page)
    public data$ = new BehaviorSubject<ApplicationModel[]>([]);

    // provides loading flag information to display spinner
    public loading$ = new BehaviorSubject<boolean>(false);

    // provides indication of total items with current filters
    public totalItems$ = new BehaviorSubject<number>(0);

    constructor(private applicationService: ApplicationService,
                private timeoutMs: number,
                private pageIndex: number,
                private pageSize: number,

                /*
                  data filter is optional, but it can be renamed or
                  extended to include all thing related to sorting and filtering.
                */
                private dataFilter: object = null) {
    }

    /*
      connect method is required by DataSource interface and is being called when gris is initialized
      and ready to accept data.
      Must return observable with data being of type <T>, ApplicationModel in this sample
    */
    connect(collectionViewer: CollectionViewer): Observable<ApplicationModel[]> {

      // Subscribe to doctored timer interval to achieve perfect polling
      this.pollingSubscription = this.loading$
                                     .pipe(filter(loading => !loading),
                                          switchMapTo(timer(this.timeoutMs, this.timeoutMs)))
                                     .subscribe(() => this.load());

      return this.data$.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.pollingSubscription.unsubscribe();
        this.data$.complete();
        this.loading$.complete();
        this.totalItems$.complete();
    }

    changePaging(pageIndex: number, pageSize: number) {
      this.pageSize = pageSize;
      this.pageIndex = pageIndex;
      this.load();
    }

    load() {
        this.loading$.next(true);

        this.applicationService
            .getApplications(this.pageIndex, this.pageSize, this.dataFilter)
            .pipe(
                   // Return empty collection on error. In real life - logging and/or notification
                  catchError(() => of({collection: [], totalItems: 0})),

                  // When request completed (failed or ok), reset loading flag. It will trigger a timer reset too.
                  finalize(() => { this.loading$.next(false); }
                 )
        )
        .subscribe(response => {
            // Publish new data
            this.data$.next(response.collection);

            // Only publish new value if amount of total items has changed
            if (this.totalItems$.value !== response.totalItems) {
              this.totalItems$.next(response.totalItems);
            }
        });

        // No need to unsubscribe, Angular handles http request completion via HttpClient automatically.
    }
}
