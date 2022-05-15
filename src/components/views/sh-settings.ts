import "@material/mwc-textfield";
import "@material/mwc-button";
import { css, html, LitElement } from "lit";
import { property, customElement, state } from "lit/decorators.js";

@customElement("sh-settings")
export class Settings extends LitElement {
  static styles = css`
  #GridContainer {
    display: grid;
    grid-template-columns: 70% 30%;
    grid-row-gap: 0.5rem;
  }
  #SaveButton {
    grid-column-start: 2;
  }
  .formField {
    grid-column-start: span 2;
  }
  `;

  private _settings = {}

  @state()
  private _isVersionSupported = false;

  set settings(value: string) {
    let data = JSON.parse(value);
    this._isVersionSupported = data?.version === 2
    this._settings = data
    this.requestUpdate();
  }

  @property({ type: String })
  get settings() {
    return JSON.stringify(this._settings);
  }

  onTextFieldChanged(evt) {
    let urlIndex  = evt.currentTarget.dataset["urlIndex"];
    if (urlIndex) {
      this._settings.remoteUrls[urlIndex] = evt.currentTarget.value;
    }
    this._settings.remoteUrls = this._settings.remoteUrls.filter(item => item.trim() !== "")
    this.requestUpdate();
    this.dispatchEvent(new CustomEvent("change", {detail: {
      settings: this.settings
    }}));
  }

  onNewItemChanged(evt) {
    this._settings.remoteUrls.push(evt.currentTarget.value);
    evt.currentTarget.value = "";
    this.requestUpdate();
    this.dispatchEvent(new CustomEvent("change", {detail: {
      settings: this.settings
    }}));
  }

  onButtonClick() {
    this.dispatchEvent(new CustomEvent("change", {detail: {
      settings: this.settings
    }}));
  }

  private _renderRemoteUrl(url: string, index: number) {
    if (url.trim() === "") {
      return null;
    }
    let output = html`
      <mwc-textfield class="formField" label="External JSON file" 
      placeholder="https://my.domain.tld/my-bookmarks.json"
      helper="Set this to the empty string to remove it from the list"
      helperPersistent
      value="${url}"
      data-url-index="${index}"
      @change="${this.onTextFieldChanged}"
      ></mwc-textfield>
    `
    return output;
  }

  override render() {
    if (!this._isVersionSupported) {
      return html`
      <p>
        Settings version is not supported
      </p>
      <p>
        The current version of the settings
        (<tt>${this._settings?.version}</tt>) is not supported by the settings
        editor. This <em>should</em> have been automatically handled. If the
        problem persists please open a bug-report, including (if possible your
        settings object shown below). Your current settings object:
      </p>
      <code>
        ${JSON.stringify(this._settings)}
    </code>
      `
    }
    let remoteUrls = this._settings.remoteUrls ?? []
    return html`
    <div id="GridContainer">
      ${remoteUrls.map(this._renderRemoteUrl, this)}
      <mwc-textfield class="formField" label="External JSON file" 
      placeholder="https://my.domain.tld/my-bookmarks.json"
      @change="${this.onNewItemChanged}"
      ></mwc-textfield>
      <mwc-button id="SaveButton" raised @click="${this.onButtonClick}">Save</mwc-button>
    </div>
    `
  }
}
