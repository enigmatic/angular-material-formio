import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormBuilderComponent } from './form-builder/form-builder.component';
import { FormDemoComponent } from './form-demo/form-demo.component';

const routes: Routes = [
  { path: '', redirectTo: '/formDemo', pathMatch: 'full' },
  { path: 'formDemo', component: FormDemoComponent},
  { path: 'formBuilder', component: FormBuilderComponent}
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
