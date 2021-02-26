import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ModelerRoutingModule } from './modeler-routing.module';
import { ModelerComponent } from './modeler.component';


@NgModule({
  declarations: [ModelerComponent],
  imports: [
    CommonModule,
    ModelerRoutingModule
  ]
})
export class ModelerModule { }
