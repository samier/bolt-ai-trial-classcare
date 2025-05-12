import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BootstrapIconsComponent } from './bootstrap-icons/bootstrap-icons.component';
import { FeatherIconsComponent } from './feather-icons/feather-icons.component';
// import { FlagIconsComponent } from './flag-icons/flag-icons.component';
import { ForntAwesomeComponent } from './fornt-awesome/fornt-awesome.component';
// import { IonicIconsComponent } from './ionic-icons/ionic-icons.component';
import { MaterialDesignIconsComponent } from './material-design-icons/material-design-icons.component';
import { MaterialIconsComponent } from './material-icons/material-icons.component';
// import { Pe7IconsComponent } from './pe7-icons/pe7-icons.component';
// import { SimpleLineIconsComponent } from './simple-line-icons/simple-line-icons.component';
// import { ThemifyIconsComponent } from './themify-icons/themify-icons.component';
// import { TypiconsIconsComponent } from './typicons-icons/typicons-icons.component';
// import { WeatherIconsComponent } from './weather-icons/weather-icons.component';

const routes: Routes = [
  {
    path:'',
    children:[
      {path:'bootstrap-icons', title:"Valex - Bootstrap Icons", component: BootstrapIconsComponent},
      {path:'feather-icons', title:"Valex - Feather Icons", component: FeatherIconsComponent},
      // {path:'flag-icons', title:"Valex - Flag Icons", component: FlagIconsComponent},
      // {path:'ionic-icons', title:"Valex - Ionic Icons", component: IonicIconsComponent},    
      {path:'material-design-icons', title:"Valex - Material Design Icons", component: MaterialDesignIconsComponent},    
      {path:'material-icons', title:"Valex - Material Icons", component: MaterialIconsComponent},    
      // {path:'pe7-icons', title:"Valex - Pe7 Icons", component: Pe7IconsComponent},    
      // {path:'simple-line-icons', title:"Valex - Simple Line Icons", component: SimpleLineIconsComponent},    
      // {path:'themify-icons', title:"Valex - Themify Icons", component: ThemifyIconsComponent},    
      // {path:'typicons-icons', title:"Valex - Typicons Icons", component: TypiconsIconsComponent},    
      // {path:'weather-icons', title:"Valex - Weather Icons", component: WeatherIconsComponent},       
      {path:'fornt-awesome', title:"Valex - Fornt Awesome", component: ForntAwesomeComponent},       
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IconRoutingModule { }
