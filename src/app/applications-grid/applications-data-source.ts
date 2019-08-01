import { DataSource } from '@angular/cdk/table';
import { ApplicationModel } from '../models/application-model';
import { BehaviorSubject, Observable, of, Subject, Subscription, interval, empty } from 'rxjs';
import { ApplicationService } from '../application.service';
import { CollectionViewer } from '@angular/cdk/collections';
import { catchError, finalize, switchMapTo, filter } from 'rxjs/operators';
import { timer } from 'rxjs';

export class ApplicationsDataSource implements DataSource<ApplicationModel> {

    private data$ = new BehaviorSubject<ApplicationModel[]>([]);
    private refreshSubscription: Subscription;
    public loading$ = new BehaviorSubject<boolean>(false);
    public totalItems$ = new BehaviorSubject<number>(0);

    constructor(private applicationService: ApplicationService,
                private timeoutMs: number,
                private pageIndex: number,
                private pageSize: number,
                private dataFilter: object = null) {
    }

    connect(collectionViewer: CollectionViewer): Observable<ApplicationModel[]> {
      this.refreshSubscription = this.loading$
                                    .pipe(filter(loading => !loading),
                                          switchMapTo(timer(this.timeoutMs, this.timeoutMs)))
                                    .subscribe(() => this.load());

      return this.data$.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.refreshSubscription.unsubscribe();
        this.data$.complete();
        this.loading$.complete();
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
            .pipe(catchError(() => of({collection: [], totalItems: 0})),
                  finalize(() => {
                    this.loading$.next(false);
                  })
        )
        .subscribe(response => {
            this.data$.next(response.collection);
            if (this.totalItems$.value !== response.totalItems) {
              this.totalItems$.next(response.totalItems);
            }
        });
    }

    get data(): ApplicationModel[] {
        return this.data$.value;
    }
}
