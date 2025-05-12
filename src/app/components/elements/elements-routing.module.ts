import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AlertsComponent } from "./alerts/alerts.component";
import { AvatarComponent } from "./avatar/avatar.component";
import { BadgeComponent } from "./badge/badge.component";
import { BreadcrumbsComponent } from "./breadcrumbs/breadcrumbs.component";
import { ButtonsComponent } from "./buttons/buttons.component";
import { DropdownComponent } from "./dropdown/dropdown.component";
import { ImagesComponent } from "./images/images.component";
import { ListgroupComponent } from "./listgroup/listgroup.component";
import { MediaobjectComponent } from "./mediaobject/mediaobject.component";
import { NavigationComponent } from "./navigation/navigation.component";
import { PaginationComponent } from "./pagination/pagination.component";
import { PopoverComponent } from "./popover/popover.component";
import { ProgressComponent } from "./progress/progress.component";
import { ScrollspyComponent } from "./scrollspy/scrollspy.component";
import { SpinnersComponent } from "./spinners/spinners.component";
import { TabsComponent } from "./tabs/tabs.component";
import { TagsComponent } from "./tags/tags.component";
import { ThumbnailsComponent } from "./thumbnails/thumbnails.component";
import { ToastComponent } from "./toast/toast.component";
import { TooltipComponent } from "./tooltip/tooltip.component";
import { TypographyComponent } from "./typography/typography.component";

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'alerts', title:"Valex - Alerts",
                component: AlertsComponent
            },
            {
                path: 'avatar', title:"Valex - Avatar",
                component: AvatarComponent
            },
            {
                path: 'badge', title:"Valex - Badge",
                component: BadgeComponent
            },
            {
                path: 'breadcrumbs', title:"Valex - Breadcrumbs",
                component: BreadcrumbsComponent
            },
            {
                path: 'buttons', title:"Valex - Buttons",
                component: ButtonsComponent
            },
            {
                path: 'dropdown', title:"Valex - Dropdown",
                component: DropdownComponent
            },
            {
                path: 'images', title:"Valex - Images",
                component: ImagesComponent
            },
            {
                path: 'listgroup', title:"Valex - Listgroup",
                component: ListgroupComponent
            },
            {
                path: 'mediaobject', title:"Valex - Mediaobject",
                component: MediaobjectComponent
            },
            {
                path: 'navigation', title:"Valex - Navigation",
                component: NavigationComponent
            },
            {
                path: 'pagination', title:"Valex - Pagination",
                component: PaginationComponent
            },
            {
                path: 'popover', title:"Valex - Popover",
                component: PopoverComponent
            },
            {
                path: 'progress', title:"Valex - Progress",
                component: ProgressComponent
            },
            {
                path: 'spinners', title:"Valex - Spinners",
                component: SpinnersComponent
            },
            {
                path: 'tabs', title:"Valex - Tabs",
                component: TabsComponent
            },
            {
                path: 'tags', title:"Valex - Tags",
                component: TagsComponent
            },
            {
                path: 'thumbnails', title:"Valex - Thumbnails",
                component: ThumbnailsComponent
            },
            {
                path: 'toast', title:"Valex - Toast",
                component: ToastComponent
            },
            {
                path: 'tooltip', title:"Valex - Tooltip",
                component: TooltipComponent
            },
            {
                path: 'typography', title:"Valex - Typography",
                component: TypographyComponent
            },
            {
                path: 'scrollspy', title:"Valex - Scrollspy",
                component: ScrollspyComponent
            }
        ]
    }
];

@NgModule ({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
}) 

export class ElementsRoutingModule {}