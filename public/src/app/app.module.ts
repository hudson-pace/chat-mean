import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { ChatComponent } from './chat/chat.component';
import { appInitializer } from './helpers/app.initializer';
import { AuthenticationService } from './services/authentication.service';
import { JwtInterceptor } from './helpers/jwt.interceptor';
import { ErrorInterceptor } from './helpers/error.interceptor';
import { RegisterComponent } from './register/register.component';
import { environment } from '../environments/environment';
import { MoveAroundComponent } from './games/move-around/move-around.component';
import { BattleshipComponent } from './games/battleship/battleship.component';
import { UserPageComponent } from './user-page/user-page.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PongComponent } from './games/pong/pong.component';
import { GameMenuComponent } from './games/game-menu/game-menu.component';

var config: SocketIoConfig = { url: environment.socketUrl, options: {} };

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    ChatComponent,
    RegisterComponent,
    MoveAroundComponent,
    BattleshipComponent,
    UserPageComponent,
    DashboardComponent,
    PongComponent,
    GameMenuComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    SocketIoModule.forRoot(config),
    FontAwesomeModule,
  ],
  providers: [
    { provide: APP_INITIALIZER, useFactory: appInitializer, multi: true, deps: [AuthenticationService] },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
