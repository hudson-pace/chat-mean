import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { AuthGuard } from './helpers/auth-guard';
import { MoveAroundComponent } from './games/move-around/move-around.component';
import { BattleshipComponent } from './games/battleship/battleship.component';
import { ForumComponent } from './forum/forum.component';
import { CreatePostComponent } from './forum/create-post/create-post.component';
import { UserPageComponent } from './user-page/user-page.component';


const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'games/move-around', component: MoveAroundComponent },
  { path: 'games/battleship', component: BattleshipComponent },
  { path: 'forum', component: ForumComponent },
  { path: 'forum/create-post', component: CreatePostComponent, canActivate: [ AuthGuard ]},
  { path: 'users/:username', component: UserPageComponent },
  { path: '**', redirectTo: '' } // default to home
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
