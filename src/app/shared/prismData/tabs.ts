export let tabsHTML1 = 
`<div class=" tab-menu-heading">
  <div class="tabs-menu1">
    <ul ngbNav #nav="ngbNav" class="panel-tabs main-nav-line">
      <li [ngbNavItem]="1">
        <a ngbNavLink>Tab 01</a>
        <ng-template ngbNavContent>
        At vero eos et accusamus et iusto odio dignissimos ducimus qui
            blanditiis praesentium voluptatum deleniti atque corrupti quos
            dolores et quas molestias excepturi sint occaecati cupiditate
            non provident, similique sunt in culpa qui officia deserunt
            mollitia animi, id est laborum et dolorum fuga. Et harum quidem
            rerum facilis est et expedita distinctio. Nam libero tempore,
            cum soluta nobis est eligendi optio cumque nihil impedit quo
            minus id quod maxime placeat facere possimus, omnis voluptas
            assumenda est, omnis dolor repellendus.
        </ng-template>
      </li>
      <li [ngbNavItem]="2">
        <a ngbNavLink>Tab 02</a>
        <ng-template ngbNavContent>
        <p>dignissimos ducimus qui blanditiis praesentium voluptatum
          deleniti atque corrupti quos dolores et quas molestias
          excepturi sint occaecati cupiditate non provident, similique
          sunt in culpa qui officia deserunt mollitia animi, id est
          laborum et dolorum fuga.</p>
        <p>Et harum quidem rerum facilis est et expedita distinctio. Nam
          libero tempore, cum soluta nobis est eligendi optio cumque
          nihil impedit quo minus id quod maxime</p>
        <p class="mb-0">placeat facere possimus, omnis voluptas
          assumenda est, omnis dolor repellendus.</p>
        </ng-template>
      </li>
      <li [ngbNavItem]="3">
        <a ngbNavLink>Tab 03</a>
        <ng-template ngbNavContent>
        <p>praesentium voluptatum deleniti atque corrupti quos dolores
          et quas molestias excepturi sint occaecati cupiditate non
          provident,</p>
        <p class="mb-0">similique sunt in culpa qui officia deserunt
          mollitia animi, id est laborum et dolorum fuga. Et harum
          quidem rerum facilis est et expedita distinctio. Nam libero
          tempore, cum soluta nobis est eligendi optio cumque nihil
          impedit quo minus id quod maxime placeat facere possimus,
          omnis voluptas assumenda est, omnis dolor repellendus.</p>
        </ng-template>
      </li>
      </ul>
  </div>
  </div>

  <div
  class="panel-body tabs-menu-body main-content-body-right border-top-0 border">
  <div [ngbNavOutlet]="nav" class="tab-pane"></div>
  <div class="tab-content">
  </div>
</div> `
export let tabsTS1 = 
`import { Component } from '@angular/core';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})
export class tabsComponent { }`

export let tabsHTML2 = 
`<div class=" tab-menu-heading">
  <ul ngbNav #nav1="ngbNav"  class="panel-tabs main-nav-line">
    <li [ngbNavItem]="1">
      <a ngbNavLink>Tab 01</a>
      <ng-template ngbNavContent>
      At vero eos et accusamus et iusto odio dignissimos ducimus qui
      blanditiis praesentium voluptatum deleniti atque corrupti quos
      dolores et quas molestias excepturi sint occaecati cupiditate
      non provident, similique sunt in culpa qui officia deserunt
      mollitia animi, id est laborum et dolorum fuga. Et harum quidem
      rerum facilis est et expedita distinctio. Nam libero tempore,
      cum soluta nobis est eligendi optio cumque nihil impedit quo
      minus id quod maxime placeat facere possimus, omnis voluptas
      assumenda est, omnis dolor repellendus.
      </ng-template>
    </li>
    <li [ngbNavItem]="2">
      <a ngbNavLink>Tab 02</a>
      <ng-template ngbNavContent>
      <p>dignissimos ducimus qui blanditiis praesentium voluptatum
        deleniti atque corrupti quos dolores et quas molestias
        excepturi sint occaecati cupiditate non provident, similique
        sunt in culpa qui officia deserunt mollitia animi, id est
        laborum et dolorum fuga.</p>
      <p>Et harum quidem rerum facilis est et expedita distinctio. Nam
        libero tempore, cum soluta nobis est eligendi optio cumque
        nihil impedit quo minus id quod maxime</p>
      <p class="mb-0">placeat facere possimus, omnis voluptas
        assumenda est, omnis dolor repellendus.</p>
      </ng-template>
    </li>
    <li [ngbNavItem]="3">
      <a ngbNavLink>Tab 03</a>
      <ng-template ngbNavContent>
      <p>praesentium voluptatum deleniti atque corrupti quos dolores
        et quas molestias excepturi sint occaecati cupiditate non
        provident,</p>
      <p class="mb-0">similique sunt in culpa qui officia deserunt
        mollitia animi, id est laborum et dolorum fuga. Et harum
        quidem rerum facilis est et expedita distinctio. Nam libero
        tempore, cum soluta nobis est eligendi optio cumque nihil
        impedit quo minus id quod maxime placeat facere possimus,
        omnis voluptas assumenda est, omnis dolor repellendus.</p>
      </ng-template>
    </li>
    </ul>
  </div>
  <div class="panel-body tabs-menu-body main-content-body-right border">
  <div [ngbNavOutlet]="nav1" class="tab-pane"></div>
  <div class="tab-content">
  </div>
</div>`
export let tabsTS2 = 
`import { Component } from '@angular/core';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})
export class tabsComponent { }`

export let tabsHTML3 = 
`<div class="tab-menu-heading">
  <div class="tabs-menu ">
    <ul ngbNav #nav3="ngbNav"  class="nav panel-tabs" orientation="horizantal">
      <li ngbNavItem="1" >
        <a ngbNavLink class="fa fa-laptop">Tab Style 01</a>
        <ng-template ngbNavContent>
        <p>At vero eos et accusamus et iusto odio dignissimos ducimus
          qui blanditiis praesentium voluptatum deleniti atque
          corrupti quos dolores et quas molestias excepturi sint
          occaecati cupiditate non provident, similique sunt in culpa
          qui officia deserunt mollitia animi, id est laborum et
          dolorum fuga.</p>
        <p class="mb-0">Et harum quidem rerum facilis est et expedita
          distinctio. Nam libero tempore, cum soluta nobis est
          eligendi optio cumque nihil impedit quo minus id quod maxime
          placeat facere possimus, omnis voluptas assumenda est, omnis
          dolor repellendus. </p>
        </ng-template>
      </li>
      <li ngbNavItem="2">
        <a ngbNavLink class="fa fa-cube">Tab Style 02</a>
        <ng-template ngbNavContent>
        <p> Et harum quidem rerum facilis est et expedita distinctio.
          Nam libero tempore, cum soluta nobis est eligendi optio
          cumque nihil impedit quo minus id quod maxime placeat facere
          possimus, omnis voluptas assumenda est, omnis dolor
          repellendus. </p>
        <p class="mb-0">At vero eos et accusamus et iusto odio
          dignissimos ducimus qui blanditiis praesentium voluptatum
          deleniti atque corrupti quos dolores et quas molestias
          excepturi sint occaecati cupiditate non provident, similique
          sunt in culpa qui officia deserunt mollitia animi, id est
          laborum et dolorum fuga.</p>
        </ng-template>
      </li>
      <li ngbNavItem="3">
        <a ngbNavLink class="fa fa-cogs">Tab Style 03</a>
        <ng-template ngbNavContent>
        <p>Temporibus autem quibusdam et aut officiis debitis aut rerum
          necessitatibus saepe eveniet ut et voluptates repudiandae
          sint et molestiae non recusandae</p>
        <p class="mb-0">Et harum quidem rerum facilis est et expedita
          distinctio. Nam libero tempore, cum soluta nobis est
          eligendi optio cumque nihil impedit quo minus id quod maxime
          placeat facere possimus, omnis voluptas assumenda est, omnis
          dolor repellendus. </p>
        </ng-template>
      </li>
      <li ngbNavItem="4">
        <a ngbNavLink class="fa fa-tasks">Tab Style 04</a>
        <ng-template ngbNavContent>
        <p>On the other hand, we denounce with righteous indignation and
          dislike men who are so beguiled and demoralized by the
          charms of pleasure of the moment, so blinded by desire</p>
        <p class="mb-0">Nam libero tempore, cum soluta nobis est
          eligendi optio cumque nihil impedit quo minus id quod maxime
          placeat facere possimus, omnis voluptas assumenda est, omnis
          dolor repellendus. Temporibus autem quibusdam et aut
          officiis debitis aut rerum necessitatibus </p>
        </ng-template>
      </li>
      </ul>
  </div>
  </div>
  <div class="panel-body tabs-menu-body">
    <div [ngbNavOutlet]="nav3" class="tab-pane"></div>
    <div class="tab-content">
  </div>
</div>`
export let tabsTS3 = 
`import { Component } from '@angular/core';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})
export class tabsComponent { }`

export let tabsHTML4 = 
`<div class="">
  <div class="panel panel-primary tabs-style-4">
    <div class="tab-menu-heading">
      <div class="tabs-menu ">

        <div class="d-flex">
          <ul ngbNav #nav4="ngbNav"  class="nav panel-tabs mr-3" orientation="vertical">
            <li ngbNavItem="1">
            <a ngbNavLink class="fa fa-laptop">Tab Style 01</a>
            <ng-template ngbNavContent>
              <p>At vero eos et accusamus et iusto odio dignissimos
                ducimus qui blanditiis praesentium voluptatum deleniti
                atque corrupti quos dolores et quas molestias excepturi
                sint occaecati cupiditate non provident, similique sunt
                in culpa qui officia deserunt mollitia animi, id est
                laborum et dolorum fuga.</p>
              <p>At vero eos et accusamus et iusto odio dignissimos
                ducimus qui blanditiis praesentium voluptatum deleniti
                atque corrupti quos dolores et quas molestias excepturi
                sint occaecati cupiditate non provident, similique sunt
                in culpa qui officia deserunt mollitia animi, id est
                laborum et dolorum fuga.</p>
              <p class="mb-0">Et harum quidem rerum facilis est et
                expedita distinctio. Nam libero tempore, cum soluta
                nobis est eligendi optio cumque nihil impedit quo minus
                id quod maxime placeat facere possimus, omnis voluptas
                assumenda est, omnis dolor repellendus. </p>
            </ng-template>
            </li>
            <li ngbNavItem="2">
            <a ngbNavLink class="fa fa-cube">Tab Style 02</a>
            <ng-template ngbNavContent>
              <p>At vero eos et accusamus et iusto odio dignissimos
                ducimus qui blanditiis praesentium voluptatum deleniti
                atque corrupti quos dolores et quas molestias excepturi
                sint occaecati cupiditate non provident, similique sunt
                in culpa qui officia deserunt mollitia animi, id est
                laborum et dolorum fuga.</p>
              <p>At vero eos et accusamus et iusto odio dignissimos
                ducimus qui blanditiis praesentium voluptatum deleniti
                atque corrupti quos dolores et quas molestias excepturi
                sint occaecati cupiditate non provident, similique sunt
                in culpa qui officia deserunt mollitia animi, id est
                laborum et dolorum fuga.</p>
              <p class="mb-0">Et harum quidem rerum facilis est et
                expedita distinctio. Nam libero tempore, cum soluta
                nobis est eligendi optio cumque nihil impedit quo minus
                id quod maxime placeat facere possimus, omnis voluptas
                assumenda est, omnis dolor repellendus. </p>
            </ng-template>
            </li>
            <li ngbNavItem="3">
            <a ngbNavLink class="fa fa-cogs">Tab Style 03</a>
            <ng-template ngbNavContent>
              <p>Temporibus autem quibusdam et aut officiis debitis aut
                rerum necessitatibus saepe eveniet ut et voluptates
                repudiandae sint et molestiae non recusandae quod maxime
                placeat facere possimus, omnis voluptas assumenda est,
                omnis dolor repellendus.</p>
              <p>Temporibus autem quibusdam et aut officiis debitis aut
                rerum necessitatibus saepe eveniet ut et voluptates
                repudiandae sint et molestiae non recusandae quod maxime
                placeat facere possimus, omnis voluptas assumenda est,
                omnis dolor repellendus.</p>
              <p class="mb-0">Et harum quidem rerum facilis est et
                expedita distinctio. Nam libero tempore, cum soluta
                nobis est eligendi optio cumque nihil impedit quo minus
                id quod maxime placeat facere possimus, omnis voluptas
                assumenda est, omnis dolor repellendus. </p>
            </ng-template>
            </li>
            <li ngbNavItem="4">
            <a ngbNavLink class="fa fa-tasks">Tab Style 04</a>
            <ng-template ngbNavContent>
              <p>On the other hand, we denounce with righteous indignation
                and dislike men who are so beguiled and demoralized by
                the charms of pleasure of the moment, so blinded by
                desire quod maxime placeat facere possimus, omnis
                voluptas assumenda est, omnis dolor repellendus.</p>
              <p>On the other hand, we denounce with righteous indignation
                and dislike men who are so beguiled and demoralized by
                the charms of pleasure of the moment, so blinded by
                desire quod maxime placeat facere possimus, omnis
                voluptas assumenda est, omnis dolor repellendus.</p>
              <p class="mb-0">Nam libero tempore, cum soluta nobis est
                eligendi optio cumque nihil impedit quo minus id quod
                maxime placeat facere possimus, omnis voluptas assumenda
                est, omnis dolor repellendus. Temporibus autem quibusdam
                et aut officiis debitis aut rerum necessitatibus </p>
            </ng-template>
            </li>
          </ul>
          </div>
      </div>
    </div>
  </div>
  </div>
  <div class="tabs-style-4 ">
  <div class="panel-body tabs-menu-body">
    <div [ngbNavOutlet]="nav4" class="tab-pane"></div>
    <div class="tab-content">
    </div>
  </div>
</div>`
export let tabsTS4 = 
`import { Component } from '@angular/core';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})
export class tabsComponent { }`

export let tabsHTML5 = 
`<div class="tabs-style-4 ">
  <div class="panel-body tabs-menu-body">
    <div [ngbNavOutlet]="nav4" class="tab-pane"></div>
    <div class="tab-content">
    </div>
  </div>
  </div>
  <div class="">
  <div class="panel panel-primary tabs-style-4">
    <div class="tab-menu-heading">
      <div class="tabs-menu ">
        <div class="d-flex">
          <ul ngbNav #nav4="ngbNav"  class="nav panel-tabs mr-3" orientation="vertical">
            <li ngbNavItem="1">
            <a ngbNavLink class="fa fa-laptop">Tab Style 01</a>
            <ng-template ngbNavContent>
              <p>At vero eos et accusamus et iusto odio dignissimos
                ducimus qui blanditiis praesentium voluptatum deleniti
                atque corrupti quos dolores et quas molestias excepturi
                sint occaecati cupiditate non provident, similique sunt
                in culpa qui officia deserunt mollitia animi, id est
                laborum et dolorum fuga.</p>
              <p>At vero eos et accusamus et iusto odio dignissimos
                ducimus qui blanditiis praesentium voluptatum deleniti
                atque corrupti quos dolores et quas molestias excepturi
                sint occaecati cupiditate non provident, similique sunt
                in culpa qui officia deserunt mollitia animi, id est
                laborum et dolorum fuga.</p>
              <p class="mb-0">Et harum quidem rerum facilis est et
                expedita distinctio. Nam libero tempore, cum soluta
                nobis est eligendi optio cumque nihil impedit quo minus
                id quod maxime placeat facere possimus, omnis voluptas
                assumenda est, omnis dolor repellendus. </p>
            </ng-template>
            </li>
            <li ngbNavItem="2">
            <a ngbNavLink class="fa fa-cube">Tab Style 02</a>
            <ng-template ngbNavContent>
              <p>At vero eos et accusamus et iusto odio dignissimos
                ducimus qui blanditiis praesentium voluptatum deleniti
                atque corrupti quos dolores et quas molestias excepturi
                sint occaecati cupiditate non provident, similique sunt
                in culpa qui officia deserunt mollitia animi, id est
                laborum et dolorum fuga.</p>
              <p>At vero eos et accusamus et iusto odio dignissimos
                ducimus qui blanditiis praesentium voluptatum deleniti
                atque corrupti quos dolores et quas molestias excepturi
                sint occaecati cupiditate non provident, similique sunt
                in culpa qui officia deserunt mollitia animi, id est
                laborum et dolorum fuga.</p>
              <p class="mb-0">Et harum quidem rerum facilis est et
                expedita distinctio. Nam libero tempore, cum soluta
                nobis est eligendi optio cumque nihil impedit quo minus
                id quod maxime placeat facere possimus, omnis voluptas
                assumenda est, omnis dolor repellendus. </p>
            </ng-template>
            </li>
            <li ngbNavItem="3">
            <a ngbNavLink class="fa fa-cogs">Tab Style 03</a>
            <ng-template ngbNavContent>
              <p>Temporibus autem quibusdam et aut officiis debitis aut
                rerum necessitatibus saepe eveniet ut et voluptates
                repudiandae sint et molestiae non recusandae quod maxime
                placeat facere possimus, omnis voluptas assumenda est,
                omnis dolor repellendus.</p>
              <p>Temporibus autem quibusdam et aut officiis debitis aut
                rerum necessitatibus saepe eveniet ut et voluptates
                repudiandae sint et molestiae non recusandae quod maxime
                placeat facere possimus, omnis voluptas assumenda est,
                omnis dolor repellendus.</p>
              <p class="mb-0">Et harum quidem rerum facilis est et
                expedita distinctio. Nam libero tempore, cum soluta
                nobis est eligendi optio cumque nihil impedit quo minus
                id quod maxime placeat facere possimus, omnis voluptas
                assumenda est, omnis dolor repellendus. </p>
            </ng-template>
            </li>
            <li ngbNavItem="4">
            <a ngbNavLink class="fa fa-tasks">Tab Style 04</a>
            <ng-template ngbNavContent>
              <p>On the other hand, we denounce with righteous indignation
                and dislike men who are so beguiled and demoralized by
                the charms of pleasure of the moment, so blinded by
                desire quod maxime placeat facere possimus, omnis
                voluptas assumenda est, omnis dolor repellendus.</p>
              <p>On the other hand, we denounce with righteous indignation
                and dislike men who are so beguiled and demoralized by
                the charms of pleasure of the moment, so blinded by
                desire quod maxime placeat facere possimus, omnis
                voluptas assumenda est, omnis dolor repellendus.</p>
              <p class="mb-0">Nam libero tempore, cum soluta nobis est
                eligendi optio cumque nihil impedit quo minus id quod
                maxime placeat facere possimus, omnis voluptas assumenda
                est, omnis dolor repellendus. Temporibus autem quibusdam
                et aut officiis debitis aut rerum necessitatibus </p>
            </ng-template>
            </li>
          </ul>
          </div>
      </div>
    </div>
    
  </div>
</div>`
export let tabsTS5 = 
`import { Component } from '@angular/core';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})
export class tabsComponent { }`