import {RouterModule, Routes} from '@angular/router';

import {NgModule} from '@angular/core';
import {UserInfoComponent} from './user-info/user-info.component';
import {ResetSelectorComponent} from './reset-selector/reset-selector.component';
import {CreatePasswordComponent} from './create-password/create-password.component';
import {CanActivateGuard} from '../shared/utils/can-activate/can-activate.guard';


const routes: Routes = [
    {
        path: 'reset-password',
        component: UserInfoComponent,
        pathMatch: 'full',
    },
    {
        path: 'reset-selector',
        component: ResetSelectorComponent,
        pathMatch: 'full',
        canActivate: [CanActivateGuard]
    },
    {
        path: 'create-password',
        component: CreatePasswordComponent,
        pathMatch: 'full',
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PasswordRoutingModule {}
