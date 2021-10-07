HTMLtoDataURLSerializer
A Web Component that is capable of serializing everything from a single unicode glyph to an entire chunk of content. 

This is built with Typescript, and no other dependencies. Currently known to work in latest Firefox, Chrome, Opera, Safari, and Edge.

This functions by generating a data-url that contains an SVG image, that itself contains a ForeignObject that is the HTML content. 
This is 'loaded' into a canvas, and then subsequently extracted, using the toDataURL() method of the canvas to a data-url that contains the entire image 
converted back to a data-url.

On completion, this method will set the 'data-url' attribute of the component. Use a MutationObserver to watch this component
and react that to attribute change. 

To render content, set the 'data-settings' attribute to a JSON representation of a 'MetaData' object. If no settings are provided,
the component will render the HTML into a 64x64 cell. 

Set the 'data-content' attribute to a JSON-encoded string containing the content. 

So then, some example code on how to use. Note the HTML for the component is basically `<html-serializer></html-serializer>`: 

```
<script src="your-generated-source-from-webpack-or-whatever.js">
...</head>
<body>
  <div id="someContent">
     <div>
      <style>
        .some_class {
          background-color: antiquewhite;
        }
      </style>
      <div class="some_class">Hey, this is a test. We'll even put Emoji in here: 🚐</div>  
    </div>
  </div>
  <div id="output">
    <img id="output_img">
  </div>
  <html-serializer id="renderer"></html-serializer>
  <script>
    let textureRendererMutationObserver 
    init() {
        const observerSpec = { attributes: true, childList: false, subtree: true }
        const textureRenderer = document.getElementById(`renderer`)
        textureRendererMutationObserver = new MutationObserver(onTextureMutation)
        textureRendererMutationObserver.observe(textureRenderer, {...observerSpec})            
    }
    
    render() {
      const renderer = document.getElementById('renderer')      
      renderer.setAttribute('data-settings', JSON.stringify({ isDocument: true, width: 640, height: 480})) 
      renderer.setAttribute('for', 'output_img') // The ID of the attribute to update with the new data-url
      renderer.setAttribute('data-target', 'src') // the name of the attribute that the mutation observer will change
      renderer.setAttribute('data-content', JSON.stringify(document.getElementById('someContent').innerHTML)) // The actual data to render      
    }
    
    onTextureMutation = ( mutations, observer ) => {      
      for(const mutation of mutations) { // look for an attribute change. You'll probably have two if you use the 'for' technique
          if (mutation.type === 'attributes') {            
              if (mutation.attributeName == "data-url") {
                  const element = mutation.target 
                  const elementID = element.getAttribute('for')
                  const targetAttribute = element.getAttribute('data-target')
                  if (element.hasAttribute('data-url')) {
                      const dataURL = element.getAttribute('data-url')                      
                      const targetElement = document.getElementById(elementID)
                      if (dataURL != undefined && dataURL != "undefined") {
                          targetElement.setAttribute(targetAttribute, dataURL)
                      }                    
                  }                    
              }
            }
        }
    }
    
    init()
    render()
  </script>```
  
  
