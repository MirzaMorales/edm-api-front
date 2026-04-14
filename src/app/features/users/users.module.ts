import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsersRoutingModule } from './users-routing.module';
import { LucideAngularModule } from 'lucide-angular';
import { UserList } from './user-list/user-list';
import { UserForm } from './user-form/user-form';

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule, 
    UsersRoutingModule,
    UserList,
    UserForm,
    LucideAngularModule
  ],
})
export class UsersModule {}
