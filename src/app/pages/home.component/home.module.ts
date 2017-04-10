import {NgModule} from "@angular/core";
import {ShoppingListComponent} from "../../components/shopping-list.component/shopping-list.component";
import {NavComponent} from "../../components/nav.component/nav.component";
import {HomeComponent} from "./home.component";
import {FormsModule} from "@angular/forms";
import {HttpModule} from "@angular/http";
import {RouterModule} from "@angular/router";
import {CityService} from "../../service/city-service";
import {ShoppingService} from "../../service/shopping-service";
import {CommonModule} from "@angular/common";
import {MainComponent} from "./main.component";
import {UserService} from "../../service/user-service";
import {MeComponent} from "./me.component/me.component";
import {HeadComponent} from "../../components/head.component/head.component";
import {AppModule} from "../../app.module";
import {PublicModule} from "../../public.module";

@NgModule({
  imports:[
    CommonModule,
    FormsModule,
    HttpModule,
    PublicModule,
    RouterModule.forChild([
      {
        path:'',
        redirectTo:'main',
        pathMatch:'full'
      },
      {
        path:'main',
        component:MainComponent,
        children:[
          // {
          //   path:'',
          //   redirectTo:'home',
          //   pathMatch:'full'
          // },
          {
            path:'home',
            component:HomeComponent
          },
          {
            path:'me',
            component:MeComponent
          }
        ]
      }


    ])
  ],
  declarations:[
    HomeComponent,
    NavComponent,
    ShoppingListComponent,
    MainComponent,
    MeComponent,
  ],
  exports:[
  ],
  providers:[
    CityService,
    ShoppingService,
    UserService
  ],
  bootstrap:[]
})
export class HomeModule {

}