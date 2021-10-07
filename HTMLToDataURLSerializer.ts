type Metadata = { 
  width?: number, 
  height?: number, 
  isDocument: boolean, // required flag, determines whether to generate a simple stylesheet, or use one embedded in the content
  fontFamily?: string, 
  fontSize?: number, 
  fontWeight?: string, 
  fontColor?: string }

class HTMLtoDataURLSerializer extends HTMLElement {
    // required for WebComponent architecture to notify this element when its attributes change
  static get observedAttributes() : Array<string> { 
    const atts = [
      'data-content',
      'data-settings',
      'data-url',
      'for'
    ]
    return atts
  } 
  
  debug : boolean
  lastRenderedText : Record<string, string>
  images : Record<string, unknown>
  imageData : Record<string, unknown>
  contentCache: Record<string, string>
  canvas : HTMLCanvasElement

  constructor() {    
    super()
  }

  /***
   * connectedCallback - Sets up values on creation of component.
   */
  connectedCallback() : void {
    this.canvas = document.createElement('canvas');
    this.images = {};    
    this.imageData = {};
    this.lastRenderedText = {}
    this.contentCache = {}
  }

  /**
   * attributeChangedCallback - Fires when an attribute is changed on the element. 
   * @param name The name of the attribute
   * @param oldValue The previous value 
   * @param newValue The new value
   */    
  attributeChangedCallback( name: string, oldValue: string, newValue: string) : void {          
    if (name == "data-content" && newValue != undefined) {      
      if (this.hasAttribute('data-settings')) {
        const settings = JSON.parse(this.getAttribute('data-settings'))
        this.renderContentToTexture(settings, decodeURIComponent(newValue))
      } else {
        this.renderContentToTexture({ height: 64, width: 64, fontSize: 64, isDocument: false }, newValue)
      }      
    }    
  }

  /**
   * renderContentToTexture - Runs the process that renders any given content to an image.
   *    
   * 
   * This functions by generating a data-url that contains an SVG image, that itself contains a ForeignObject that is the HTML content. 
   * This is 'loaded' into a canvas, and then subsequently extracted, using the toDataURL() method of the canvas.
   * 
   * On completion, this method will set the 'data-url' attribute of the component. Use a MutationObserver to watch this component
   * and react that to attribute change. 
   * 
   * To render content, set the 'data-settings' attribute to a JSON representation of a 'MetaData' object. If no settings are provided,
   * the component will render the HTML into a 64x64 cell. 
   * 
   * Set the 'data-content' attribute to a URI-encoded version of a JSON-encoded string containing the content. I know that sound complicated, 
   * but when using attributes, strings are king, and quotes frustrate things if not properly handled. 
   * 
   * @param data MetaData to describe what to do.
   * @param content Content to render
   */
  renderContentToTexture(data : Metadata, content : string) : void {              
    const style = `font-family: ${data.fontFamily ? data.fontFamily : 'sans-serif'};` +                
                `font-size: 48px;` +
                `font-color: ${data.fontColor ? data.fontColor : 'inherit;'}` +
                `align: center;` +
                `vertical-align: middle`

    
    const contentToSerialize = data.isDocument != true ? 
      `<div style="${style}">${content}</div>` :
      `<div>${JSON.parse(content)}</div> 
    `
    const canvas = document.createElement('canvas')
    const context2D = canvas.getContext('2d')
    
    canvas.width = data.width as number
    canvas.height = data.height as number

    const rendererImg = document.createElement('img')
    rendererImg.addEventListener('load', (ev) => {
      context2D.drawImage(ev.target as HTMLVideoElement, 0, 0)
      const dataURL = canvas.toDataURL()
      this.contentCache[content] = dataURL;
      this.setAttribute('data-url',dataURL)
      console.log("Completed!")
      console.log(dataURL)
    })
    try {
      rendererImg.src = 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${data.width}" height="${data.height}"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml">${contentToSerialize}</div></foreignObject></svg>`)
    } catch (e) {
      console.log(e)
    }
  }
}

customElements.define('html-serializer', HTMLtoDataURLSerializer);

export default HTMLtoDataURLSerializer
