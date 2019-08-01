import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { ApplicationsDataSource } from './applications-data-source';
import { ApplicationService } from '../application.service';
import { MatPaginator } from '@angular/material';
import { ExtendedSelectionModel } from '../models/extended-selection-model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-applications-grid',
  templateUrl: './applications-grid.component.html',
  styleUrls: ['./applications-grid.component.scss']
})
export class ApplicationsGridComponent implements OnInit, AfterViewInit, OnDestroy {
  dataSource: ApplicationsDataSource;
  pages: number[] = [];
  @ViewChild(MatPaginator) paginator: MatPaginator;

  private pageNumbersCollectionSubscription: Subscription;
  private pageChangesSubscription: Subscription;
  private readonly defaultPageIndex = 0;
  private readonly defaultPageSize = 5;
  private readonly defaultRefreshTimeoutMs = 5000;
  private readonly allowMultiSelect = true;
  private readonly initialSelection = [];
  private selection: ExtendedSelectionModel<string>;

  displayedColumns = ['select', 'name', 'ip'];
  constructor(private applicationService: ApplicationService) {}

  ngOnInit() {
    this.selection = new ExtendedSelectionModel<string>(
      this.allowMultiSelect,
      this.initialSelection
    );

    this.dataSource = new ApplicationsDataSource(this.applicationService,
                                                 this.defaultRefreshTimeoutMs,
                                                 this.defaultPageIndex,
                                                 this.defaultPageSize);

    this.dataSource.load();

    this.pageNumbersCollectionSubscription = this.dataSource.totalItems$.subscribe(totalItems => {
      this.initPagesCollection(totalItems / this.paginator.pageSize);
    });
  }

  ngAfterViewInit(): void {
    this.pageChangesSubscription = this.paginator.page.subscribe(() => this.onPaginationChange());
  }

  ngOnDestroy(): void {
    this.pageNumbersCollectionSubscription.unsubscribe();
    this.pageChangesSubscription.unsubscribe();
  }

  selectThisPage(): void {
    if (!this.dataSource.data || !this.dataSource.data.length) {
      return;
    }

    this.dataSource.data.forEach(row =>  this.selection.select(row.id));
  }

  selectAll(): void {
    if (!this.dataSource.data || !this.dataSource.data.length) {
      return;
    }

    this.dataSource.data.forEach(row => this.selection.select(row.id));
    this.selection.allSelected = true;
  }

  deselectAll(): void {
    if (!this.dataSource.data || !this.dataSource.data.length) {
      return;
    }

    this.selection.clear();
    this.selection.allSelected = false;
  }

  selectedCount(): number {
    if (this.selection.allSelected) {
      return this.dataSource.totalItems$.value;
    }

    return this.selection.selected.length;
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
    this.dataSource.changePaging(this.paginator.pageIndex, this.paginator.pageSize);
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
}
