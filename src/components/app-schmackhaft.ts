import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ref, createRef, Ref } from "lit/directives/ref.js";
import "./components/sh-link";
import "./components/sh-taglist";
import "./components/sh-linklist";
import "./components/layout-vsplit";
import { LinkList } from "./components/sh-linklist";
import { TagList } from "./components/sh-taglist";
import { Links } from "./core/links";
import { TagStateTransition } from "../types";
import "material-icon-component/md-icon.js";
import { classMap } from "lit/directives/class-map.js";

@customElement("app-schmackhaft")
export class Schmackhaft extends LitElement {
  static styles = css`
    * {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
        Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
      font-size: 16px;
    }

    :host {
      display: block;
    }

    #Toolbar {
      display: flex;
      flex-direction: row;
      margin-bottom: 0.5rem;
    }

    #Toast {
      flex-grow: 1;
    }

    .action {
      flex-grow: 0;
      margin-left: 0.5em;
      cursor: pointer;
      border-radius: 100%;
      width: 20px;
      height: 20px;
      text-align: center;
    }

    .action:hover {
      background-color: #bdd5e4;
      color: #4747d4;
    }

    layout-vsplit {
      height: 100%;
    }

    @keyframes rotate {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .spinning {
      animation-name: rotate;
      animation-duration: 1s;
      animation-timing-function: linear;
      animation-iteration-count: infinite;
    }
  `;

  _toastTimerId: number = 0;
  tagsRef: Ref<HTMLInputElement> = createRef();
  searchTextRef: Ref<HTMLInputElement> = createRef();
  linkListRef: Ref<LinkList> = createRef();
  tagListRef: Ref<TagList> = createRef();

  private _links: Links = new Links();

  @state()
  private _toast = "";

  @state()
  private _busy = false;

  @property({ type: String })
  get links() {
    return this._links.toJson();
  }

  set links(data: string) {
    this._links = Links.fromJson(data);
    this.requestUpdate();
  }

  get refreshClasses() {
    return {
      spinning: this._busy,
    };
  }

  showToast(message: string, timeout: number): void {
    if (this._toastTimerId > 0) {
      window.clearTimeout(this._toastTimerId);
    }
    this._busy = true;
    this._toast = message;
    this._toastTimerId = window.setTimeout(() => {
      this._toast = "";
      this._busy = false;
    }, timeout);
  }

  onChipClicked(evt: { detail: string }) {
    switch(evt.detail.direction) {
      case TagStateTransition.ADVANCE:
      default:
        this._links.advanceState(evt.detail.name);
        break;
      case TagStateTransition.REVERSE:
        this._links.reverseState(evt.detail.name);
        break;
    }
    this.requestUpdate();
    this.linkListRef.value?.requestUpdate();
    this.tagListRef.value?.requestUpdate();
  }

  onRefreshClicked() {
    this.showToast("refreshing...", 2000);
  }

  onSettingsClicked() {
    // TODO
  }

  onHelpClicked() {
    // TODO
  }

  override render() {
    return html`
      <div id="Toolbar">
        <div id="Toast">${this._toast}</div>
        <div class="action" @click="${this.onRefreshClicked}">
          <md-icon class=${classMap(this.refreshClasses)}>refresh</md-icon>
        </div>
        <div class="action" @click="${this.onSettingsClicked}">
          <md-icon>settings</md-icon>
        </div>
        <div class="action" @click="${this.onHelpClicked}">
          <md-icon>help</md-icon>
        </div>
      </div>
      <layout-vsplit>
        <sh-taglist
          slot="top"
          ${ref(this.tagListRef)}
          @chipClicked="${this.onChipClicked}"
          .links="${this._links}"
          dense
        ></sh-taglist>
        <sh-linklist
          slot="bottom"
          ${ref(this.linkListRef)}
          .links=${this._links}
          .renderSearchedTags="${false}"
          @chipClicked="${this.onChipClicked}"
          dense
        ></sh-linklist>
      </layout-vsplit>
    `;
  }
}
