import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { AuthGuard } from './helpers/auth-guard';
import { MoveAroundComponent } from './games/move-around/move-around.component';
import { BattleshipComponent } from './games/battleship/battleship.component';
import { UserPageComponent } from './user-page/user-page.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PongComponent } from './games/pong/pong.component';


const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'games/move-around', component: MoveAroundComponent },
  { path: 'games/battleship', component: BattleshipComponent },
  { path: 'games/pong', component: PongComponent },
  { path: 'users/:username', component: UserPageComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [ AuthGuard ] },
  { path: '**', redirectTo: '' } // default to home
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
