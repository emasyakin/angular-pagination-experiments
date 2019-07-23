import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ApplicationsDataSource } from './applications-data-source';
import { ApplicationService } from '../application.service';
import { MatPaginator } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { ApplicationModel } from '../models/application.model';
@Component({
  selector: 'app-applications-grid',
  templateUrl: './applications-grid.component.html',
  styleUrls: ['./applications-grid.component.scss']
})
export class ApplicationsGridComponent implements OnInit, AfterViewInit {
  dataSource: ApplicationsDataSource;
  @ViewChild(MatPaginator)
  paginator: MatPaginator;
  private defaultPageIndex = 0;
  private defaultPageSize = 5;

  private initialSelection = [];
  private allowMultiSelect = true;
  private selection: SelectionModel<ApplicationModel>;

  displayedColumns = ['select', 'name', 'ip'];
  constructor(private applicationService: ApplicationService) {}

  ngOnInit() {
    this.selection = new SelectionModel<ApplicationModel>(
      this.allowMultiSelect,
      this.initialSelection
    );
    this.dataSource = new ApplicationsDataSource(this.applicationService);
    this.dataSource.loadApplications(
      this.defaultPageIndex,
      this.defaultPageSize
    );
  }

  ngAfterViewInit(): void {
    this.paginator.page.subscribe(() => this.onPaginationChange());
  }

  onPaginationChange() {
    this.dataSource.loadApplications(
      this.paginator.pageIndex,
      this.paginator.pageSize
    );
  }

  isAllSelected(): boolean {
    if (!this.dataSource.data || !this.dataSource.data.length) {
      return false;
    }

    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle(): void {
    if (!this.dataSource.data || !this.dataSource.data.length) {
      return;
    }

    const allSelected = this.isAllSelected();
    this.dataSource.data.forEach(row => allSelected ? this.selection.deselect(row) : this.selection.select(row));
  }
}
