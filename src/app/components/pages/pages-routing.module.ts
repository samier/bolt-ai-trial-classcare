import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
// import { AboutUsComponent } from "./about-us/about-us.component";
// import { EditProfileComponent } from "./edit-profile/edit-profile.component";
// import { EmptyPageComponent } from "./empty-page/empty-page.component";
// import { FaqsComponent } from "./faqs/faqs.component";
// import { GalleryComponent } from "./gallery/gallery.component";
// import { InvoiceComponent } from "./invoice/invoice.component";
// import { PricingComponent } from "./pricing/pricing.component";
import { ProfileComponent } from "./profile/profile.component";
import { SettingsComponent } from "./settings/settings.component";
import { SwitcherOneComponent } from "./switcher-one/switcher-one.component";
// import { TodotaskComponent } from "./todotask/todotask.component";

const routes: Routes = [
    {
        path: '',
        children: [
            // {
            //     path: 'editprofile', title:"Valex - Editprofile",
            //     component: EditProfileComponent
            // },
            // {
            //     path: 'emptypage', title:"Valex - Emptypage",
            //     component: EmptyPageComponent
            // },
            // {
            //     path: 'faqs', title:"Valex - Faqs",
            //     component: FaqsComponent
            // },
            // {
            //     path: 'gallery', title:"Valex - Gallery",
            //     component: GalleryComponent
            // },
            // {
            //     path: 'invoice', title:"Valex - Invoice",
            //     component: InvoiceComponent
            // },
            // {
            //     path: 'pricing', title:"Valex - Pricing",
            //     component: PricingComponent
            // },
            {
                path: 'profile', title:"Valex - Profile",
                component: ProfileComponent
            },
            // {
            //     path: 'todotask', title:"Valex - Todotask",
            //     component: TodotaskComponent
            // },
            // {
            //     path: 'aboutus', title:"Valex - Aboutus",
            //     component: AboutUsComponent
            // },
            {
                path: 'settings', title:"Valex - Settings",
                component: SettingsComponent
            }
        ],
    }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class PagesRoutingModule { }