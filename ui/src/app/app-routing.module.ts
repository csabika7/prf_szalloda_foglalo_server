import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReservationComponent } from './reservation/reservation.component';
import { UserComponent } from './user/user.component';
import { AuthGuardService } from './auth-guard.service';

const routes: Routes = [
  {path: 'reservation', component: ReservationComponent},
  {path: 'user', component: UserComponent, canActivate: [AuthGuardService]},

  {path: '**', component: ReservationComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
