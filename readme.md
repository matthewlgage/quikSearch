# quikSearch
QuikSearch is a light weight vanilla javascript plugin that handles javascript based web app searching and templating.

## Set Up
QuikSearch initial set up is pretty simple. There are only a few required guidelines to follow.
1. QuikSearch must be referenced before any additional logic is applied to the rendered HTML. 
2. API response must return either an array of objects or an object with a data key that contains an array of objects
3. The following required 'QuikElements' must be placed into the DOM.

## Quik Elements
QuikSearch expects to find elements with specific classes, IDs, and attributes to complete its functionality accordingly. 

**Required Elements**
Template wrapping element:
```html
<div id="quikSearch"></div>
```
Search Input:
```html
<input type="text" id="quikInput"/>
```
Search Submit:
```html
<button type="button" id="quikSubmit"></button>
```

## Facets & Filters

Facet:
```html
<button type="button" class="quikFacet" data-facet="facetKey" data-value="facetValue"></button>
<!-- data-facet/data-value values cannot contain spaces-->
```
**Note: Facets need the 'quikFacet' class, data-facet, and data-value attributes**
***
Filter:
```html
<input type="checkbox" class="quikFilter" data-filter="filterKey" data-value="filterValue"/>
<!-- data-filter/data-value values cannot contain spaces-->
```
**Note: Filters need the 'quikFilter' class, data-filter, and data-value attributes**

Filters also create tracking buttons when checked. These buttons expect a container to live in:
```html
<div id="quikFilterTracking"></div>
```

## Templating 
Any templating HTML expected to be handled by QuikSearch should be placed inside a container with an ID of 'QuikSearch'. 
```html
<div id="quikSearch"></div>
```
This allows the container to be hidden until QuikSearch has finished rendering templates.

Creating a template is as easy as using the 'quikFor' attribute. QuikSearch expects a Javascript array like the one below to render HTML elements. Let's use this array to create our first QuikSearch elements.
```javascript
data: [
	{
		firstName: 'John',
		lastName: 'Deere',
	},
	{
		firstName: 'Jane',
		lastName: 'Doe',
	}
]
```
Now, let's create a QuikSearch HTML template.
```html
<ul>
	<li data-quikFor="item in data">
		{{ item.firstName }} {{ item.lastName }}
	</li>
</ul>
```
The rendered HTML becomes: 

```html
<ul>
	<li>John Deere</li>
	<li>Jane Doe</li>
</ul>
```

### QuikSearch also allows 'quikFor' nesting as well. Using the Javascript array below, let's create a more advanced QuikSearch template.
```javascript
data: [
	{
		address: {
			street: '123 Sesame',
			city: 'New York',
			state: 'NY'
		}
	}
]
```
Now, let's create a QuikSearch HTML template.
```html
<ul>
	<li data-quikFor="item in data">
		{{ item.address.street }}, {{ item..address.city }}, {{ item.address.State }}
	</li>
</ul>
```
The rendered resulting HTML becomes: 

```html
<ul>
	<li>123 Sesame Street, New York, NY</li>
</ul>
```
**Note: QuikSearch must always have only 1 parent quikFor container.**

## Pagination & Infinite Scroll

**Pagination** in QuikSearch is created dynamically on page load and only occurs if the number of items received from the API call is higher than the 'pageSize' query parameter. The default page size is 10. This 'string' default can be altered here:
```javascript
quikSearch.queryParameters.filters.pageSize
```
The buttons that are dynamically created expect a container(s) with the class below:
```html
<div class="quikPagination"></div>
```
The default amount of maximum buttons will be 5. You can edit this 'integer' default here:
```javascript
quikSearch.queryParameters.pageButtons
```
You can also dynamically alter the page size with select dropdown(s):
```html
<select class="quikPaginator">
	<option data-facet="pageSize" data-value="10">10</option>
	<option data-facet="pageSize" data-value="15">15</option>
</select>
```
***
**Infinite Scroll/Load More** functionality is possible with QuikSearch. You can trigger the loading of additional information by either creating a button trigger:
```html
<button type="button" id="quikMore"></div>
```
Or by referencing the QuikSearch load more function directly:
```javascript
quikSearch.loadMore()
```
Once an additional call has been made to the API, these new objects will be appended to the already existing response object in QuikSearch:
```javascript
quikSearch.repsonse
```
**Note: HTML items will be created dynamically using the parent 'quikFor' element template specified in your HTML**
 
## License
[MIT](http://www.opensource.org/licenses/mit-license.php) 