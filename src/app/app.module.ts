import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ApplicationsGridComponent } from './applications-grid/applications-grid.component';
import { FakeDataService } from './services/fake-data.service';
import { HttpClientInMemoryWebApiModule  } from 'angular-in-memory-web-api';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { MatCheckboxModule, MatCardModule, MatPaginatorModule, MatProgressSpinnerModule, MatSortModule, MatTableModule  } from '@angular/material';

@NgModule({
  declarations: [
    AppComponent,
    ApplicationsGridComponent
  ],
  imports: [
    HttpClientModule,
    MatTableModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatCardModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientInMemoryWebApiModule .forRoot(FakeDataService),
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
