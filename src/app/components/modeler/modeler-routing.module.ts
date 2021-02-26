import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModelerComponent } from './modeler.component';

const routes: Routes = [{ path: '', component: ModelerComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModelerRoutingModule { }
