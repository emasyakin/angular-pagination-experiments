import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { ApplicationsDataSource } from './applications-data-source';
import { ApplicationService } from '../application.service';
import { MatPaginator, PageEvent } from '@angular/material';
import { ExtendedSelectionModel } from '../models/extended-selection-model';
import { Subject, timer, interval, Observable, Subscription, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
@Component({
  selector: 'app-applications-grid',
  templateUrl: './applications-grid.component.html',
  styleUrls: ['./applications-grid.component.scss']
})
export class ApplicationsGridComponent implements OnInit, AfterViewInit, OnDestroy {
  dataSource: ApplicationsDataSource;
  pages: number[] = [];
  @ViewChild(MatPaginator) paginator: MatPaginator;

  private refreshSubscription: Subscription;
  private defaultPageIndex = 0;
  private defaultPageSize = 5;

  private initialSelection = [];
  private allowMultiSelect = true;
  private selection: ExtendedSelectionModel<string>;

  displayedColumns = ['select', 'name', 'ip'];
  constructor(private applicationService: ApplicationService) {}

  ngOnInit() {
    this.refreshSubscription = interval(5000).subscribe(() => {
      if (this.dataSource && !this.dataSource.loading$.value) {
        this.dataSource.loadApplications(this.paginator.pageIndex, this.paginator.pageSize);
      }
    });

    this.selection = new ExtendedSelectionModel<string>(
      this.allowMultiSelect,
      this.initialSelection
    );

    this.dataSource = new ApplicationsDataSource(this.applicationService);
    this.dataSource.loadApplications(
      this.defaultPageIndex,
      this.defaultPageSize
    );

    this.dataSource.totalItems$.subscribe(totalItems => {
      this.initPagesCollection(totalItems / this.paginator.pageSize);
    });
  }

  ngOnDestroy(): void {
    this.refreshSubscription.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.paginator.page.subscribe((e: PageEvent) => this.onPaginationChange());
  }

  private initPagesCollection(pageCount: number) {
    if (this.pages.length !== pageCount) {
      const pages = this.pages = [];
      for (let i = 1, len = pageCount + 1; i < len; i++) { pages.push(i); }
    }
  }

  private onPaginationChange() {
    const totalPages = this.dataSource.totalItems$.value / this.paginator.pageSize;
    this.initPagesCollection(totalPages);
    this.dataSource.loadApplications(
      this.paginator.pageIndex,
      this.paginator.pageSize
    );
  }

  toggle(rowId: string) {
    this.selection.toggle(rowId);

    if (this.selection.allSelected && !this.selection.isSelected(rowId)) {
      this.selection.allSelected = false;
      this.dataSource.data.forEach(row => row.id !== rowId ? this.selection.select(row.id) : null);
    }
  }

  changePage(pageIndex: number): void {
    if (this.paginator.pageIndex === pageIndex) {
      return;
    }

    this.paginator.pageIndex = pageIndex;
    //A hack to workaround an issue: https://github.com/angular/components/issues/8417
    this.paginator._changePageSize(this.paginator.pageSize);
  }

  masterToggle(): void {
    if (!this.dataSource.data || !this.dataSource.data.length) {
      return;
    }

    if (this.selection.allSelected) {
      this.selection.clear();
      this.selection.allSelected = false;
    } else {
      this.dataSource.data.forEach(row => this.selection.select(row.id));
      this.selection.allSelected = true;
    }
  }
}
