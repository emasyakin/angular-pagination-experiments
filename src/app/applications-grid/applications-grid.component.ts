import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ApplicationsDataSource } from './applications-data-source';
import { ApplicationService } from '../application.service';
import { MatPaginator, MatInput, PageEvent } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { ApplicationModel } from '../models/application.model';
@Component({
  selector: 'app-applications-grid',
  templateUrl: './applications-grid.component.html',
  styleUrls: ['./applications-grid.component.scss']
})
export class ApplicationsGridComponent implements OnInit, AfterViewInit {
  dataSource: ApplicationsDataSource;
  pages: number[] = [];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  private defaultPageIndex = 0;
  private defaultPageSize = 5;

  private initialSelection = [];
  private allowMultiSelect = true;
  private selection: SelectionModel<string>;
  private allSelected: boolean;

  displayedColumns = ['select', 'name', 'ip'];
  constructor(private applicationService: ApplicationService) {}

  ngOnInit() {
    this.allSelected = false;
    this.selection = new SelectionModel<string>(
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

    if (this.allSelected) {
      this.selection.clear();
      this.allSelected = false;
    } else {
      this.dataSource.data.forEach(row => this.selection.select(row.id));
      this.allSelected = true;
    }

    if (!allSelected) {
      this.selection.clear();
    }
  }
}
