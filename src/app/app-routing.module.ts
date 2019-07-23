import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ApplicationsGridComponent } from './applications-grid/applications-grid.component';

const routes: Routes = [
  { path: '', component: ApplicationsGridComponent }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
