export let dropdownHTML1 = 
`<div class="example">
<div class="btn-group ms-2 mt-2 mb-2">
    <div class="btn-group ms-2 mt-2 mb-2">
        <div ngbDropdown class="d-inline-block wd-xl-80p">
            <button type="button" class="btn ripple btn-primary" id="dropdownBasic1"
                ngbDropdownToggle>Dropdown Menu</button>
            <div ngbDropdownMenu aria-labelledby="dropdownBasic1">
                <button ngbDropdownItem>Action</button>
                <button ngbDropdownItem>Another action</button>
                <button ngbDropdownItem>Something else here</button>
            </div>
        </div>
    </div>
</div>
<div class="btn-group ms-2 mt-2 mb-2">
    <div class="btn-group ms-2 mt-2 mb-2">
        <div ngbDropdown class="d-inline-block wd-xl-80p">
            <button type="button" class="btn ripple btn-secondary" id="dropdownBasic1"
                ngbDropdownToggle>Dropdown Menu</button>
            <div ngbDropdownMenu aria-labelledby="dropdownBasic1">
                <button ngbDropdownItem>Action</button>
                <button ngbDropdownItem>Another action</button>
                <button ngbDropdownItem>Something else here</button>
            </div>
        </div>
    </div>
</div>
<div class="btn-group ms-2 mt-2 mb-2">
    <div class="btn-group ms-2 mt-2 mb-2">
        <div ngbDropdown class="d-inline-block wd-xl-80p">
            <button type="button" class="btn ripple btn-teal" id="dropdownBasic1"
                ngbDropdownToggle>Dropdown Menu</button>
            <div ngbDropdownMenu aria-labelledby="dropdownBasic1">
                <button ngbDropdownItem>Action</button>
                <button ngbDropdownItem>Another action</button>
                <button ngbDropdownItem>Something else here</button>
            </div>
        </div>
    </div>
</div>
<div class="btn-group ms-2 mt-2 mb-2">
    <div class="btn-group ms-2 mt-2 mb-2">
        <div ngbDropdown class="d-inline-block wd-xl-80p">
            <button type="button" class="btn ripple btn-light" id="dropdownBasic1"
                ngbDropdownToggle>Dropdown Menu</button>
            <div ngbDropdownMenu aria-labelledby="dropdownBasic1">
                <button ngbDropdownItem>Action</button>
                <button ngbDropdownItem>Another action</button>
                <button ngbDropdownItem>Something else here</button>
            </div>
        </div>
    </div>
</div>
</div>`
export let dropdownTS1 = 
`import { Component } from '@angular/core';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
})
export class DropdownComponent { }`

export let dropdownHTML2 = 
`<div class="example">
<div class="btn-group ms-2 mt-2 mb-2">
    <div class="btn-group ms-2 mt-2 mb-2">
        <div ngbDropdown class="d-inline-block wd-xl-80p">
            <button type="button" class="btn ripple btn-rounded btn-primary"
                id="dropdownBasic1" ngbDropdownToggle>Dropdown Menu</button>
            <div ngbDropdownMenu aria-labelledby="dropdownBasic1">
                <button ngbDropdownItem>Action</button>
                <button ngbDropdownItem>Another action</button>
                <button ngbDropdownItem>Something else here</button>
            </div>
        </div>
    </div>
</div>
<div class="btn-group ms-2 mt-2 mb-2">
    <div class="btn-group ms-2 mt-2 mb-2">
        <div ngbDropdown class="d-inline-block wd-xl-80p">
            <button type="button" class="btn ripple btn-rounded btn-secondary"
                id="dropdownBasic1" ngbDropdownToggle>Dropdown Menu</button>
            <div ngbDropdownMenu aria-labelledby="dropdownBasic1">
                <button ngbDropdownItem>Action</button>
                <button ngbDropdownItem>Another action</button>
                <button ngbDropdownItem>Something else here</button>
            </div>
        </div>
    </div>
</div>
<div class="btn-group ms-2 mt-2 mb-2">
    <div class="btn-group ms-2 mt-2 mb-2">
        <div ngbDropdown class="d-inline-block wd-xl-80p">
            <button type="button" class="btn ripple  btn-rounded btn-teal"
                id="dropdownBasic1" ngbDropdownToggle>Dropdown Menu</button>
            <div ngbDropdownMenu aria-labelledby="dropdownBasic1">
                <button ngbDropdownItem>Action</button>
                <button ngbDropdownItem>Another action</button>
                <button ngbDropdownItem>Something else here</button>
            </div>
        </div>
    </div>
</div>
<div class="btn-group ms-2 mt-2 mb-2">
    <div class="btn-group ms-2 mt-2 mb-2">
        <div ngbDropdown class="d-inline-block wd-xl-80p">
            <button type="button" class="btn ripple  btn-rounded btn-light"
                id="dropdownBasic1" ngbDropdownToggle>Dropdown Menu</button>
            <div ngbDropdownMenu aria-labelledby="dropdownBasic1">
                <button ngbDropdownItem>Action</button>
                <button ngbDropdownItem>Another action</button>
                <button ngbDropdownItem>Something else here</button>
            </div>
        </div>
    </div>
</div>
</div>`
export let dropdownTS2 = 
`import { Component } from '@angular/core';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
})
export class DropdownComponent { }`

export let dropdownHTML3 = 
`<div class="example">
<div class="btn-group ms-2 mt-2 mb-2">
    <div ngbDropdown class="d-inline-block wd-xl-80p">
        <button type="button" class="btn ripple btn-outline-primary" id="dropdownBasic1"
            ngbDropdownToggle>Dropdown Menu</button>
        <div ngbDropdownMenu aria-labelledby="dropdownBasic1">
            <button ngbDropdownItem>Action</button>
            <button ngbDropdownItem>Another action</button>
            <button ngbDropdownItem>Something else here</button>
        </div>
    </div>
</div>
<div class="btn-group ms-2 mt-2 mb-2">
    <div ngbDropdown class="d-inline-block wd-xl-80p">
        <button type="button" class="btn ripple btn-outline-secondary" id="dropdownBasic1"
            ngbDropdownToggle>Dropdown Menu</button>
        <div ngbDropdownMenu aria-labelledby="dropdownBasic1">
            <button ngbDropdownItem>Action</button>
            <button ngbDropdownItem>Another action</button>
            <button ngbDropdownItem>Something else here</button>
        </div>
    </div>
</div>
<div class="btn-group ms-2 mt-2 mb-2">
    <div ngbDropdown class="d-inline-block wd-xl-80p">
        <button type="button" class="btn ripple btn-outline-success" id="dropdownBasic1"
            ngbDropdownToggle>Dropdown Menu</button>
        <div ngbDropdownMenu aria-labelledby="dropdownBasic1">
            <button ngbDropdownItem>Action</button>
            <button ngbDropdownItem>Another action</button>
            <button ngbDropdownItem>Something else here</button>
        </div>
    </div>
</div>
<div class="btn-group ms-2 mt-2 mb-2">
    <div ngbDropdown class="d-inline-block wd-xl-80p">
        <button type="button" class="btn ripple btn-outline-light" id="dropdownBasic1"
            ngbDropdownToggle>Dropdown Menu</button>
        <div ngbDropdownMenu aria-labelledby="dropdownBasic1">
            <button ngbDropdownItem>Action</button>
            <button ngbDropdownItem>Another action</button>
            <button ngbDropdownItem>Something else here</button>
        </div>
    </div>
</div>
</div>`
export let dropdownTS3 = 
`import { Component } from '@angular/core';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
})
export class DropdownComponent { }`

export let dropdownHTML4 = 
`<div class="example">
<div class="btn-group ms-2 mt-2 mb-2">
    <div ngbDropdown class="d-inline-block wd-xl-80p">
        <button type="button" class="btn ripple btn-rounded btn-outline-primary"
            id="dropdownBasic1" ngbDropdownToggle>Dropdown Menu</button>
        <div ngbDropdownMenu aria-labelledby="dropdownBasic1">
            <button ngbDropdownItem>Action</button>
            <button ngbDropdownItem>Another action</button>
            <button ngbDropdownItem>Something else here</button>
        </div>
    </div>
</div>
<div class="btn-group ms-2 mt-2 mb-2">
    <div ngbDropdown class="d-inline-block wd-xl-80p">
        <button type="button" class="btn ripple btn-rounded btn-outline-secondary"
            id="dropdownBasic1" ngbDropdownToggle>Dropdown Menu</button>
        <div ngbDropdownMenu aria-labelledby="dropdownBasic1">
            <button ngbDropdownItem>Action</button>
            <button ngbDropdownItem>Another action</button>
            <button ngbDropdownItem>Something else here</button>
        </div>
    </div>
</div>
<div class="btn-group ms-2 mt-2 mb-2">
    <div ngbDropdown class="d-inline-block wd-xl-80p">
        <button type="button" class="btn ripple  btn-rounded btn-outline-success"
            id="dropdownBasic1" ngbDropdownToggle>Dropdown Menu</button>
        <div ngbDropdownMenu aria-labelledby="dropdownBasic1">
            <button ngbDropdownItem>Action</button>
            <button ngbDropdownItem>Another action</button>
            <button ngbDropdownItem>Something else here</button>
        </div>
    </div>
</div>
<div class="btn-group ms-2 mt-2 mb-2">
    <div ngbDropdown class="d-inline-block wd-xl-80p">
        <button type="button" class="btn ripple  btn-rounded btn-outline-light"
            id="dropdownBasic1" ngbDropdownToggle>Dropdown Menu</button>
        <div ngbDropdownMenu aria-labelledby="dropdownBasic1">
            <button ngbDropdownItem>Action</button>
            <button ngbDropdownItem>Another action</button>
            <button ngbDropdownItem>Something else here</button>
        </div>
    </div>
</div>
</div>`
export let dropdownTS4 = 
`import { Component } from '@angular/core';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
})
export class DropdownComponent { }`

export let dropdownHTML5 = 
`<div class="example">
<div class="btn-group ms-2 mt-2 mb-2">
    <div ngbDropdown class="btn-group">
        <button type="button" class="btn btn-primary btn-rounded">Action</button>
        <button type="button" ngbDropdownToggle
            class="btn btn-primary  btn-rounded dropdown-toggle split-dropdown"
            id="dropdownMenuDate" data-toggle="dropdown" aria-haspopup="true"
            aria-expanded="false">
            <span class="sr-only">Toggle Dropdown</span>
        </button>
        <div ngbDropdownMenu class="dropdown-menu-right" aria-labelledby="dropdownMenuDate"
            data-x-placement="bottom-end">
            <a ngbDropdownItem href="javascript:;">2015</a>
            <a ngbDropdownItem href="javascript:;">2016</a>
            <a ngbDropdownItem href="javascript:;">2017</a>
            <a ngbDropdownItem href="javascript:;">2018</a>
        </div>
    </div>
</div>
<div class="btn-group ms-2 mt-2 mb-2">
    <div ngbDropdown class="btn-group">
        <button type="button" class="btn btn-danger  btn-rounded">Action</button>
        <button type="button" ngbDropdownToggle
            class="btn btn-danger  btn-rounded dropdown-toggle split-dropdown"
            id="dropdownMenuDate" data-toggle="dropdown" aria-haspopup="true"
            aria-expanded="false">
            <span class="sr-only">Toggle Dropdown</span>
        </button>
        <div ngbDropdownMenu class="dropdown-menu-right" aria-labelledby="dropdownMenuDate"
            data-x-placement="bottom-end">
            <a ngbDropdownItem href="javascript:;">2015</a>
            <a ngbDropdownItem href="javascript:;">2016</a>
            <a ngbDropdownItem href="javascript:;">2017</a>
            <a ngbDropdownItem href="javascript:;">2018</a>
        </div>
    </div>
</div>
<div class="btn-group ms-2 mt-2 mb-2">
    <div ngbDropdown class="btn-group">
        <button type="button" class="btn btn-info  btn-rounded">Action</button>
        <button type="button" ngbDropdownToggle
            class="btn btn-info  btn-rounded dropdown-toggle split-dropdown"
            id="dropdownMenuDate" data-toggle="dropdown" aria-haspopup="true"
            aria-expanded="false">
            <span class="sr-only">Toggle Dropdown</span>
        </button>
        <div ngbDropdownMenu class="dropdown-menu-right" aria-labelledby="dropdownMenuDate"
            data-x-placement="bottom-end">
            <a ngbDropdownItem href="javascript:;">2015</a>
            <a ngbDropdownItem href="javascript:;">2016</a>
            <a ngbDropdownItem href="javascript:;">2017</a>
            <a ngbDropdownItem href="javascript:;">2018</a>
        </div>
    </div>
</div>
<div class="btn-group ms-2 mt-2 mb-2">
    <div ngbDropdown class="btn-group">
        <button type="button" class="btn btn-warning  btn-rounded">Action</button>
        <button type="button" ngbDropdownToggle
            class="btn btn-warning  btn-rounded dropdown-toggle split-dropdown"
            id="dropdownMenuDate" data-toggle="dropdown" aria-haspopup="true"
            aria-expanded="false">
            <span class="sr-only">Toggle Dropdown</span>
        </button>
        <div ngbDropdownMenu class="dropdown-menu-right" aria-labelledby="dropdownMenuDate"
            data-x-placement="bottom-end">
            <a ngbDropdownItem href="javascript:;">2015</a>
            <a ngbDropdownItem href="javascript:;">2016</a>
            <a ngbDropdownItem href="javascript:;">2017</a>
            <a ngbDropdownItem href="javascript:;">2018</a>
        </div>
    </div>
</div>
<div class="btn-group ms-2 mt-2 mb-2">
    <div ngbDropdown class="btn-group">
        <button type="button" class="btn btn-light  btn-rounded">Action</button>
        <button type="button" ngbDropdownToggle
            class="btn btn-light  btn-rounded dropdown-toggle split-dropdown"
            id="dropdownMenuDate" data-toggle="dropdown" aria-haspopup="true"
            aria-expanded="false">
            <span class="sr-only">Toggle Dropdown</span>
        </button>
        <div ngbDropdownMenu class="dropdown-menu-right" aria-labelledby="dropdownMenuDate"
            data-x-placement="bottom-end">
            <a ngbDropdownItem href="javascript:;">2015</a>
            <a ngbDropdownItem href="javascript:;">2016</a>
            <a ngbDropdownItem href="javascript:;">2017</a>
            <a ngbDropdownItem href="javascript:;">2018</a>
        </div>
    </div>
</div>
</div>`
export let dropdownTS5 = 
`import { Component } from '@angular/core';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
})
export class DropdownComponent { }`

export let dropdownHTML6 = 
`<div class="example">
<div class="btn-group ms-2 mb-2" ngbDropdown>
    <button type="button" class="btn btn-primary">Action</button>
    <button type="button" class="btn btn-primary dropdown-toggle split-dropdown"
        ngbDropdownToggle>
        <span class="caret"></span>
        <span class="sr-only">Toggle Dropdown</span>
    </button>
    <div ngbDropdownMenu aria-labelledby="dropdownBasic1">
        <button ngbDropdownItem>Action</button>
        <button ngbDropdownItem>Another action</button>
        <button ngbDropdownItem>Something else here</button>
    </div>
</div>
<div class="btn-group ms-2 mb-2" ngbDropdown>
    <button type="button" class="btn btn-danger">Action</button>
    <button type="button" class="btn btn-danger dropdown-toggle split-dropdown"
        ngbDropdownToggle>
        <span class="caret"></span>
        <span class="sr-only">Toggle Dropdown</span>
    </button>
    <div ngbDropdownMenu aria-labelledby="dropdownBasic1">
        <button ngbDropdownItem>Action</button>
        <button ngbDropdownItem>Another action</button>
        <button ngbDropdownItem>Something else here</button>
    </div>
</div>
<div class="btn-group ms-2 mb-2" ngbDropdown>
    <button type="button" class="btn btn-info">Action</button>
    <button type="button" class="dropdown-toggle btn btn-info split-dropdown"
        ngbDropdownToggle>
        <span class="caret"></span>
        <span class="sr-only">Toggle Dropdown</span>
    </button>
    <div ngbDropdownMenu aria-labelledby="dropdownBasic1">
        <button ngbDropdownItem>Action</button>
        <button ngbDropdownItem>Another action</button>
        <button ngbDropdownItem>Something else here</button>
    </div>
</div>
<div class="btn-group ms-2 mb-2" ngbDropdown>
    <button type="button" class="btn btn-warning">Action</button>
    <button type="button" class="btn btn-warning dropdown-toggle split-dropdown"
        ngbDropdownToggle>
        <span class="caret"></span>
        <span class="sr-only">Toggle Dropdown</span>
    </button>
    <div ngbDropdownMenu aria-labelledby="dropdownBasic1">
        <button ngbDropdownItem>Action</button>
        <button ngbDropdownItem>Another action</button>
        <button ngbDropdownItem>Something else here</button>
    </div>
</div>
<div class="btn-group ms-2 mb-2" ngbDropdown>
    <button type="button" class="btn btn-light">Action</button>
    <button type="button" class="btn btn-light dropdown-toggle split-dropdown"
        ngbDropdownToggle>
        <span class="caret"></span>
        <span class="sr-only">Toggle Dropdown</span>
    </button>
    <div ngbDropdownMenu aria-labelledby="dropdownBasic1">
        <button ngbDropdownItem>Action</button>
        <button ngbDropdownItem>Another action</button>
        <button ngbDropdownItem>Something else here</button>
    </div>
</div>
</div>`
export let dropdownTS6 = 
`import { Component } from '@angular/core';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
})
export class DropdownComponent { }`

export let dropdownHTML7 = 
`<div class="example">
<div class="btn-group ms-2 mb-2" ngbDropdown>
    <button type="button" class="btn btn-outline-primary btn-rounded">Action</button>
    <button type="button"
        class="btn btn-outline-primary  btn-rounded dropdown-toggle split-dropdown"
        ngbDropdownToggle>
        <span class="caret"></span>
        <span class="sr-only">Toggle Dropdown</span>
    </button>
    <div ngbDropdownMenu aria-labelledby="dropdownBasic1">
        <button ngbDropdownItem>Action</button>
        <button ngbDropdownItem>Another action</button>
        <button ngbDropdownItem>Something else here</button>
    </div>
</div>
<div class="btn-group ms-2 mb-2" ngbDropdown>
    <button type="button" class="btn btn-outline-danger btn-rounded">Action</button>
    <button type="button"
        class="btn btn-outline-danger  btn-rounded dropdown-toggle split-dropdown"
        ngbDropdownToggle>
        <span class="caret"></span>
        <span class="sr-only">Toggle Dropdown</span>
    </button>
    <div ngbDropdownMenu aria-labelledby="dropdownBasic1">
        <button ngbDropdownItem>Action</button>
        <button ngbDropdownItem>Another action</button>
        <button ngbDropdownItem>Something else here</button>
    </div>
</div>
<div class="btn-group ms-2 mb-2" ngbDropdown>
    <button type="button" class="btn btn-outline-info btn-rounded">Action</button>
    <button type="button"
        class="btn btn-outline-info  btn-rounded dropdown-toggle split-dropdown"
        ngbDropdownToggle>
        <span class="caret"></span>
        <span class="sr-only">Toggle Dropdown</span>
    </button>
    <div ngbDropdownMenu aria-labelledby="dropdownBasic1">
        <button ngbDropdownItem>Action</button>
        <button ngbDropdownItem>Another action</button>
        <button ngbDropdownItem>Something else here</button>
    </div>
</div>
<div class="btn-group ms-2 mb-2" ngbDropdown>
    <button type="button" class="btn btn-outline-warning btn-rounded">Action</button>
    <button type="button"
        class="btn btn-outline-warning  btn-rounded dropdown-toggle split-dropdown"
        ngbDropdownToggle>
        <span class="caret"></span>
        <span class="sr-only">Toggle Dropdown</span>
    </button>
    <div ngbDropdownMenu aria-labelledby="dropdownBasic1">
        <button ngbDropdownItem>Action</button>
        <button ngbDropdownItem>Another action</button>
        <button ngbDropdownItem>Something else here</button>
    </div>
</div>
<div class="btn-group ms-2 mb-2" ngbDropdown>
    <button type="button" class="btn btn-outline-light btn-rounded">Action</button>
    <button type="button"
        class="btn btn-outline-light  btn-rounded dropdown-toggle split-dropdown"
        ngbDropdownToggle>
        <span class="caret"></span>
        <span class="sr-only">Toggle Dropdown</span>
    </button>
    <div ngbDropdownMenu aria-labelledby="dropdownBasic1">
        <button ngbDropdownItem>Action</button>
        <button ngbDropdownItem>Another action</button>
        <button ngbDropdownItem>Something else here</button>
    </div>
</div>
</div>`
export let dropdownTS7 = 
`import { Component } from '@angular/core';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
})
export class DropdownComponent { }`

export let dropdownHTML8 = `
<div class="example">
<div class="btn-group ms-2 mb-2" ngbDropdown>
    <button type="button" class="btn btn-outline-primary">Action</button>
    <button type="button" class="btn btn-outline-primary dropdown-toggle split-dropdown"
        ngbDropdownToggle>
        <span class="caret"></span>
        <span class="sr-only">Toggle Dropdown</span>
    </button>
    <div ngbDropdownMenu aria-labelledby="dropdownBasic1">
        <button ngbDropdownItem>Action</button>
        <button ngbDropdownItem>Another action</button>
        <button ngbDropdownItem>Something else here</button>
    </div>
</div>
<div class="btn-group ms-2 mb-2" ngbDropdown>
    <button type="button" class="btn btn-outline-danger">Action</button>
    <button type="button" class="btn btn-outline-danger dropdown-toggle split-dropdown"
        ngbDropdownToggle>
        <span class="caret"></span>
        <span class="sr-only">Toggle Dropdown</span>
    </button>
    <div ngbDropdownMenu aria-labelledby="dropdownBasic1">
        <button ngbDropdownItem>Action</button>
        <button ngbDropdownItem>Another action</button>
        <button ngbDropdownItem>Something else here</button>
    </div>
</div>
<div class="btn-group ms-2 mb-2" ngbDropdown>
    <button type="button" class="btn btn-outline-info">Action</button>
    <button type="button" class="btn btn-outline-info dropdown-toggle split-dropdown"
        ngbDropdownToggle>
        <span class="caret"></span>
        <span class="sr-only">Toggle Dropdown</span>
    </button>
    <div ngbDropdownMenu aria-labelledby="dropdownBasic1">
        <button ngbDropdownItem>Action</button>
        <button ngbDropdownItem>Another action</button>
        <button ngbDropdownItem>Something else here</button>
    </div>
</div>
<div class="btn-group ms-2 mb-2" ngbDropdown>
    <button type="button" class="btn btn-outline-warning">Action</button>
    <button type="button" class="btn btn-outline-warning dropdown-toggle split-dropdown"
        ngbDropdownToggle>
        <span class="caret"></span>
        <span class="sr-only">Toggle Dropdown</span>
    </button>
    <div ngbDropdownMenu aria-labelledby="dropdownBasic1">
        <button ngbDropdownItem>Action</button>
        <button ngbDropdownItem>Another action</button>
        <button ngbDropdownItem>Something else here</button>
    </div>
</div>
<div class="btn-group ms-2 mb-2" ngbDropdown>
    <button type="button" class="btn btn-outline-light">Action</button>
    <button type="button" class="btn btn-outline-light dropdown-toggle split-dropdown"
        ngbDropdownToggle>
        <span class="caret"></span>
        <span class="sr-only">Toggle Dropdown</span>
    </button>
    <div ngbDropdownMenu aria-labelledby="dropdownBasic1">
        <button ngbDropdownItem>Action</button>
        <button ngbDropdownItem>Another action</button>
        <button ngbDropdownItem>Something else here</button>
    </div>
</div>
</div>
`
export let dropdownHTML9 = `
<div class="example">
<div class="btn-group ms-2 mt-2 mb-2">
    <div class="btn-group ms-2 mt-2 mb-2">
        <div ngbDropdown class="d-inline-block wd-xl-80p">
            <button type="button" class="btn ripple btn-warning" id="dropdownBasic1"
                ngbDropdownToggle>Dropdown Menu</button>
            <div ngbDropdownMenu aria-labelledby="dropdownBasic1">
                <button ngbDropdownItem>Action</button>
                <button ngbDropdownItem class="active">Another action</button>
                <button ngbDropdownItem>Something else here</button>
            </div>
        </div>
    </div>
</div>
<div class="btn-group ms-2 mt-2 mb-2">
    <div class="btn-group ms-2 mt-2 mb-2">
        <div ngbDropdown class="d-inline-block wd-xl-80p">
            <button type="button" class="btn ripple btn-teal" id="dropdownBasic1"
                ngbDropdownToggle>Dropdown Menu</button>
            <div ngbDropdownMenu aria-labelledby="dropdownBasic1">
                <button ngbDropdownItem>Action</button>
                <button ngbDropdownItem>Another action</button>
                <button ngbDropdownItem class="active">Something else here</button>
            </div>
        </div>
    </div>
</div>
<div class="btn-group ms-2 mt-2 mb-2">
    <div class="btn-group ms-2 mt-2 mb-2">
        <div ngbDropdown class="d-inline-block wd-xl-80p">
            <button type="button" class="btn ripple btn-secondary" id="dropdownBasic1"
                ngbDropdownToggle>Dropdown Menu</button>
            <div ngbDropdownMenu aria-labelledby="dropdownBasic1">
                <button ngbDropdownItem class="active">Action</button>
                <button ngbDropdownItem>Another action</button>
                <button ngbDropdownItem>Something else here</button>
            </div>
        </div>
    </div>
</div>
<div class="btn-group ms-2 mt-2 mb-2">
    <div class="btn-group ms-2 mt-2 mb-2">
        <div ngbDropdown class="d-inline-block wd-xl-80p">
            <button type="button" class="btn ripple btn-danger" id="dropdownBasic1"
                ngbDropdownToggle>Dropdown Menu</button>
            <div ngbDropdownMenu aria-labelledby="dropdownBasic1">
                <button ngbDropdownItem>Action</button>
                <button ngbDropdownItem class="active">Another action</button>
                <button ngbDropdownItem>Something else here</button>
            </div>
        </div>
    </div>
</div>
</div>
`
export let dropdownHTML10 = `
<div class="example">
<div class="btn-group ms-2 mt-2 mb-2">
    <div class="btn-group ms-2 mt-2 mb-2">
        <div ngbDropdown class="d-inline-block wd-xl-80p">
            <button type="button" class="btn ripple btn-primary" id="dropdownBasic1"
                ngbDropdownToggle>Dropdown Menu</button>
            <div ngbDropdownMenu aria-labelledby="dropdownBasic1">
                <button ngbDropdownItem>Action</button>
                <button ngbDropdownItem class="disabled">Another action</button>
                <button ngbDropdownItem>Something else here</button>
            </div>
        </div>
    </div>
</div>
<div class="btn-group ms-2 mt-2 mb-2">
    <div class="btn-group ms-2 mt-2 mb-2">
        <div ngbDropdown class="d-inline-block wd-xl-80p">
            <button type="button" class="btn ripple btn-teal" id="dropdownBasic1"
                ngbDropdownToggle>Dropdown Menu</button>
            <div ngbDropdownMenu aria-labelledby="dropdownBasic1">
                <button ngbDropdownItem>Action</button>
                <button ngbDropdownItem class="disabled">Another action</button>
                <button ngbDropdownItem>Something else here</button>
            </div>
        </div>
    </div>
</div>
<div class="btn-group ms-2 mt-2 mb-2">
    <div class="btn-group ms-2 mt-2 mb-2">
        <div ngbDropdown class="d-inline-block wd-xl-80p">
            <button type="button" class="btn ripple btn-danger" id="dropdownBasic1"
                ngbDropdownToggle>Dropdown Menu</button>
            <div ngbDropdownMenu aria-labelledby="dropdownBasic1">
                <button ngbDropdownItem class="disabled">Action</button>
                <button ngbDropdownItem>Another action</button>
                <button ngbDropdownItem>Something else here</button>
            </div>
        </div>
    </div>
</div>
<div class="btn-group ms-2 mt-2 mb-2">
    <div class="btn-group ms-2 mt-2 mb-2">
        <div ngbDropdown class="d-inline-block wd-xl-80p">
            <button type="button" class="btn ripple btn-info" id="dropdownBasic1"
                ngbDropdownToggle>Dropdown Menu</button>
            <div ngbDropdownMenu aria-labelledby="dropdownBasic1">
                <button ngbDropdownItem>Action</button>
                <button ngbDropdownItem>Another action</button>
                <button ngbDropdownItem class="disabled">Something else here</button>
            </div>
        </div>
    </div>
</div>
</div>
`
export let dropdownHTML11 = `
<div class="example">
<div class="btn-group ms-2 mt-2 mb-2">
    <div class="btn-group ms-2 mt-2 mb-2">
        <div ngbDropdown class="d-inline-block wd-xl-80p">
            <button type="button" class="btn ripple btn-secondary" id="dropdownBasic1"
                ngbDropdownToggle>Dropdown Menu</button>
            <div ngbDropdownMenu aria-labelledby="dropdownBasic1">
                <h6
                    class="dropdown-header tx-uppercase tx-11 tx-bold tx-inverse tx-spacing-1">
                    Dropdown header</h6>
                <button ngbDropdownItem>Action</button>
                <button ngbDropdownItem>Another action</button>
                <button ngbDropdownItem class="disabled">Something else here</button>
            </div>
        </div>
    </div>
</div>
<div class="btn-group ms-2 mt-2 mb-2">
    <div class="btn-group ms-2 mt-2 mb-2">
        <div ngbDropdown class="d-inline-block wd-xl-80p">
            <button type="button" class="btn ripple btn-primary" id="dropdownBasic1"
                ngbDropdownToggle>Dropdown Menu</button>
            <div ngbDropdownMenu aria-labelledby="dropdownBasic1">
                <h6
                    class="dropdown-header tx-uppercase tx-11 tx-bold tx-inverse tx-spacing-1">
                    Dropdown header</h6>
                <button ngbDropdownItem>Action</button>
                <button ngbDropdownItem>Another action</button>
                <button ngbDropdownItem class="disabled">Something else here</button>
            </div>
        </div>
    </div>
</div>
<div class="btn-group ms-2 mt-2 mb-2">
    <div class="btn-group ms-2 mt-2 mb-2">
        <div ngbDropdown class="d-inline-block wd-xl-80p">
            <button type="button" class="btn ripple btn-info" id="dropdownBasic1"
                ngbDropdownToggle>Dropdown Menu</button>
            <div ngbDropdownMenu aria-labelledby="dropdownBasic1">
                <h6
                    class="dropdown-header tx-uppercase tx-11 tx-bold tx-inverse tx-spacing-1">
                    Dropdown header</h6>
                <button ngbDropdownItem>Action</button>
                <button ngbDropdownItem>Another action</button>
                <button ngbDropdownItem class="disabled">Something else here</button>
            </div>
        </div>
    </div>
</div>
<div class="btn-group ms-2 mt-2 mb-2">
    <div class="btn-group ms-2 mt-2 mb-2">
        <div ngbDropdown class="d-inline-block wd-xl-80p">
            <button type="button" class="btn ripple btn-warning" id="dropdownBasic1"
                ngbDropdownToggle>Dropdown Menu</button>
            <div ngbDropdownMenu aria-labelledby="dropdownBasic1">
                <h6
                    class="dropdown-header tx-uppercase tx-11 tx-bold tx-inverse tx-spacing-1">
                    Dropdown header</h6>
                <button ngbDropdownItem>Action</button>
                <button ngbDropdownItem>Another action</button>
                <button ngbDropdownItem class="disabled">Something else here</button>
            </div>
        </div>
    </div>
</div>
</div>
`
export let dropdownHTML12 = `
<div class="example">
							<div class="row row-xs">
								<div class="col-sm-6 my-2">
									<div ngbDropdown [placement]="'right-top'" class="dropend">
										<button class="btn ripple btn-info" ngbDropdownToggle id="droprightMenuButton"
											type="button">Dropright
											Menu</button>
										<div aria-labelledby="droprightMenuButton" ngbDropdownMenu class="tx-13">
											<a ngbDropdownItem href="javascript:void(0);">Action</a>
											<a ngbDropdownItem href="javascript:void(0);">Another action</a>
											<a ngbDropdownItem href="javascript:void(0);">Something else here</a>
										</div>
									</div>
								</div>
								<div class="col-sm-6 my-2">
									<div ngbDropdown [placement]="'left-top'" class="dropstart">
										<button class="btn ripple btn-danger" ngbDropdownToggle id="dropleftMenuButton"
											type="button">Dropleft Menu</button>
										<div aria-labelledby="dropleftMenuButton" ngbDropdownMenu class="tx-13">
											<a ngbDropdownItem href="javascript:void(0);">Action</a>
											<a ngbDropdownItem href="javascript:void(0);">Another action</a>
											<a ngbDropdownItem href="javascript:void(0);">Something else here</a>
										</div>
									</div>
								</div>
							</div>
						</div>
`
export let dropdownHTML13 = `
<div class="example">
							<div class="row row-xs wd-xl-80p">
								<div class="btn-group mb-2 mt-2">
									<div ngbDropdown class="d-inline-block wd-xl-80p">
										<button type="button" class="btn btn-danger dropdown-toggle" id="dropdownBasic1"
											ngbDropdownToggle><i class="fe fe-mail  "></i></button>
										<div ngbDropdownMenu aria-labelledby="dropdownBasic1">
											<h6
												class="dropdown-header tx-uppercase tx-11 tx-bold tx-inverse tx-spacing-1">
												Dropdown header</h6>
											<button ngbDropdownItem>Action</button>
											<button ngbDropdownItem>Another action</button>
											<button ngbDropdownItem>Something else here</button>
											<a ngbDropdownItem class="dropdown-item"
												href="javascript:void(0);">Separated link</a>
										</div>
									</div>
								</div>
								<div class="btn-group mb-2 mt-2">
									<div ngbDropdown class="d-inline-block wd-xl-80p">
										<button type="button" class="btn btn-info dropdown-toggle" id="dropdownBasic1"
											ngbDropdownToggle><i class="fe fe-more-horizontal "></i></button>
										<div ngbDropdownMenu aria-labelledby="dropdownBasic1">
											<h6
												class="dropdown-header tx-uppercase tx-11 tx-bold tx-inverse tx-spacing-1">
												Dropdown header</h6>
											<button ngbDropdownItem>Action</button>
											<button ngbDropdownItem>Another action</button>
											<button ngbDropdownItem>Something else here</button>
											<a ngbDropdownItem class="dropdown-item"
												href="javascript:void(0);">Separated link</a>
										</div>
									</div>
								</div>
								<div class="btn-group mb-2 mt-2">
									<div ngbDropdown class="d-inline-block wd-xl-80p">
										<button type="button" class="btn btn-secondary dropdown-toggle"
											id="dropdownBasic1" ngbDropdownToggle><i
												class="fe fe-more-vertical "></i></button>
										<div ngbDropdownMenu aria-labelledby="dropdownBasic1">
											<h6
												class="dropdown-header tx-uppercase tx-11 tx-bold tx-inverse tx-spacing-1">
												Dropdown header</h6>
											<button ngbDropdownItem>Action</button>
											<button ngbDropdownItem>Another action</button>
											<button ngbDropdownItem>Something else here</button>
											<a ngbDropdownItem class="dropdown-item"
												href="javascript:void(0);">Separated link</a>
										</div>
									</div>
								</div>
								<div class="btn-group mb-2 mt-2">
									<div ngbDropdown class="d-inline-block wd-xl-80p">
										<button type="button" class="btn btn-outline-primary dropdown-toggle"
											id="dropdownBasic1" ngbDropdownToggle><i
												class="fe fe-settings "></i></button>
										<div ngbDropdownMenu aria-labelledby="dropdownBasic1">
											<h6
												class="dropdown-header tx-uppercase tx-11 tx-bold tx-inverse tx-spacing-1">
												Dropdown header</h6>
											<button ngbDropdownItem>Action</button>
											<button ngbDropdownItem>Another action</button>
											<button ngbDropdownItem>Something else here</button>
											<a ngbDropdownItem class="dropdown-item"
												href="javascript:void(0);">Separated link</a>
										</div>
									</div>
								</div>
							</div>
						</div>
`
export let dropdownHTML14 = `
<div class="example">
<div class="btn-group ms-2  mt-2 mb-2">
    <div ngbDropdown>
        <button class="btn ripple btn-info " ngbDropdownToggle type="button">Dropdown Menu

        </button>
        <div class="tx-13" ngbDropdownMenu>
            <h6 class="dropdown-header tx-uppercase tx-11 tx-bold tx-inverse tx-spacing-1">
                Dropdown
                header</h6>
            <a class="dropdown-item" href="javascript:;">Action</a>
            <a class="dropdown-item" href="javascript:;">Another action</a>
            <a class="dropdown-item" href="javascript:;">Something else here</a>
            <div class="dropdown-divider"></div>
            <a class="dropdown-item" href="javascript:;">Separated link</a>
        </div>
    </div>
</div>
<div class="btn-group ms-2  mt-2 mb-2">
    <div ngbDropdown>
        <button class="btn ripple btn-primary " ngbDropdownToggle type="button">Dropdown
            Menu

        </button>
        <div class="tx-13" ngbDropdownMenu>
            <h6 class="dropdown-header tx-uppercase tx-11 tx-bold tx-inverse tx-spacing-1">
                Dropdown
                header</h6>
            <a class="dropdown-item" href="javascript:;">Action</a>
            <a class="dropdown-item" href="javascript:;">Another action</a>
            <a class="dropdown-item" href="javascript:;">Something else here</a>
            <div class="dropdown-divider"></div>
            <a class="dropdown-item" href="javascript:;">Separated link</a>
        </div>
    </div>
</div>
<div class="btn-group ms-2  mt-2 mb-2">
    <div ngbDropdown>
        <button class="btn ripple btn-danger " ngbDropdownToggle type="button">Dropdown Menu

        </button>
        <div class="tx-13" ngbDropdownMenu>
            <h6 class="dropdown-header tx-uppercase tx-11 tx-bold tx-inverse tx-spacing-1">
                Dropdown
                header</h6>
            <a class="dropdown-item" href="javascript:;">Action</a>
            <a class="dropdown-item" href="javascript:;">Another action</a>
            <a class="dropdown-item" href="javascript:;">Something else here</a>
            <div class="dropdown-divider"></div>
            <a class="dropdown-item" href="javascript:;">Separated link</a>
        </div>
    </div>
</div>
<div class="btn-group ms-2  mt-2 mb-2">
    <div ngbDropdown>
        <button class="btn ripple btn-warning " ngbDropdownToggle type="button">Dropdown
            Menu

        </button>
        <div class="tx-13" ngbDropdownMenu>
            <h6 class="dropdown-header tx-uppercase tx-11 tx-bold tx-inverse tx-spacing-1">
                Dropdown
                header</h6>
            <a class="dropdown-item" href="javascript:;">Action</a>
            <a class="dropdown-item" href="javascript:;">Another action</a>
            <a class="dropdown-item" href="javascript:;">Something else here</a>
            <div class="dropdown-divider"></div>
            <a class="dropdown-item" href="javascript:;">Separated link</a>
        </div>
    </div>
</div>
</div>
`