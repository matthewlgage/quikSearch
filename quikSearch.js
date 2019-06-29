/* ---------------------------------------------
quikSearch
Version: 1.0.0
Author: Matthew Gage
Licensed under MIT: http://www.opensource.org/licenses/mit-license.php
---------------------------------------------- */

(function() {
    quikSearch = {
        //Build template object for 'load more' functionality;
        buildTemplate: function() {
            var quikTemplate = document.querySelector('[data-quikTemplate]');
            
            if (quikTemplate !== null) {
                var quikTemplateElement = document.createElement(quikTemplate.localName);
            
                for (var attribute of quikTemplate.attributes) {
                   quikTemplateElement.setAttribute(attribute.name, attribute.value)
                }
                quikTemplateElement.innerHTML = quikTemplate.innerHTML;
                quikSearch.quikTemplate = quikTemplateElement;
            }
        },

        //Render 'QuikFor' element HTML
        createForHTML: function(template, object, child, key) {
            var quikElement = template.cloneNode(true); 
            var quikString = quikElement.dataset.quikfor.split(' ')[2];
            var quikVarArray = quikElement.innerHTML.match(/{{(.*?)}}/g);
            var quikObject = quikSearch.returnObject(object, quikString, 1);

            for (var quikChild of quikElement.children) {
                if (quikChild.getAttribute('data-quikFor') !== null) {
                    var quikSubString = quikChild.dataset.quikfor.split(' ')[2];                    
                    var quikSubObject = quikSearch.returnObject(quikObject, quikSubString, 1);
                    
                    for (var quikKey in quikSubObject) {
                        quikElement.removeAttribute('data-quikFor');
                        quikChild.insertAdjacentElement('beforebegin', quikSearch.createForHTML(quikChild, quikSubObject, true, quikSubObject[quikKey]))
                    }
                    quikChild.remove();
                }
            }

            if (child) {
                quikElement.innerHTML = quikElement.innerHTML.replace(quikVarArray[0], key);
            }            

            if (!child) {
                for (var quikVar of quikVarArray) {
                    var quikString = quikVar.replace(/\s+|[{}]/g, '');
                    var quikRender = quikSearch.returnObject(quikObject, quikString, 1);
                    quikElement.innerHTML = quikElement.innerHTML.replace(quikVar, quikRender);
                } 
            }

            quikElement.removeAttribute('data-quikFor');
            quikElement.getAttribute('data-quikTemplate') !== null ? quikElement.removeAttribute('data-quikTemplate') : '';
            return quikElement;
        },

        //Replace HTML template with final rendered HTML
        createHTML: function() {
            //Render 'QuikFor' elements
            for (var i = 0; quikSearch.quikFor.length > i; i++) {
                var quikFor = quikSearch.quikFor[i];
                var quikString = quikFor.dataset.quikfor.split(' ')[2];
                var quikArray = quikSearch.returnObject(quikSearch.response.data, quikString, 1);

                if (quikArray !== undefined) {
                    for (var object of quikArray) {
                        quikFor.insertAdjacentElement('beforebegin', quikSearch.createForHTML(quikFor, object, false));
                    }
                }
                quikFor.remove();
            }
            quikSearch.quikApp.removeAttribute('quik-cloak');
        },

        //Initializes quikSearch
        init: function() {
            quikSearch.quikApp.setAttribute('quik-cloak','');

            //Add click event for facets (always buttons)
            for (var i = 0; quikSearch.quikFacet.length > i; i++) {
                quikSearch.quikFacet[i].addEventListener('click', quikSearch.setFacets);
            }

            //Add click event for filters (always checkboxes)
            for (var i = 0; quikSearch.quikFilter.length > i; i++) {
                quikSearch.quikFilter[i].addEventListener('click', quikSearch.setFilters);
            }

            //Add click event for dedicated search button
            quikSearch.quikSubmit.addEventListener('click', quikSearch.search);

            //Trigger search on enter press of dedicated search input
            quikSearch.quikInput.addEventListener('keydown', function(e) {
                if (e.keyCode === 13) {
                    quikSearch.search();
                }
            });

            //Add change event for paginators (always selects)
            for (var i = 0; quikSearch.quikPaginator.length > i; i++) {
                quikSearch.quikPaginator[i].addEventListener('change', quikSearch.setPagination);
            }

            quikSearch.buildTemplate();
            quikSearch.requestContent();
        },

        //Loads more items into response object and generates corresponding HTML - uses parent quikFor as template
        loadMore: function(parent) {
            var requestMore = new XMLHttpRequest();

            requestMore.open('GET', quikSearch.queryParameters.apiUrl);
            requestMore.onload = function() {
                var response = JSON.parse(requestMore.response);

                if (typeof response[Symbol.iterator] === 'function') {
                    for (var object of response) {
                        quikSearch.response.data.push(object);
                        parent.appendChild(quikSearch.createForHTML(quikSearch.quikTemplate, object, false));
                    }
                }
                else {
                    for (var object of response.data) {
                        quikSearch.response.data.push(object);
                        parent.appendChild(quikSearch.createForHTML(quikSearch.quikTemplate, object, false));
                    }
                }
            };

            requestMore.onreadystatechange = function() {
                if (requestMore.readyState !== 4 && requestMore.status !== 200) {
                    console.log("QuikSearch Error: QuikSearch was unable to retrieve data")
                }
            }
            requestMore.send();
        },

        //Default QuikSearch Parameters
        queryParameters: {
            apiUrl: 'https://jsonplaceholder.typicode.com/users',
            filters: {
                pageIndex: '0',
                pageSize: '10',
            },
            keyword: '',
            pageMax: 10,
            pageButtons: 5,
            pagination: false
        },

        //Classes & ID's used to bind filters, facets, search inputs, etc with QuikSearch
        quikApp: document.querySelector('#quikSearch'),
        quikFacet: document.querySelectorAll('.quikFacet'),
        quikFilter: document.querySelectorAll('.quikFilter'),
        quikFilterTrack: document.querySelector('#quikFilterTracking'),
        quikFor: document.querySelectorAll('[data-quikFor]'),
        quikInput: document.querySelector('#quikInput'),
        quikPagination: document.querySelectorAll('.quikPagination'),
        quikPaginator: document.querySelectorAll('.quikPaginator'),
        quikQuery: window.location.search.split('?')[1],
        quikSubmit: document.querySelector('#quikSubmit'),
        quikTemplate: null,

        //Request content from API
        requestContent: function() {
            var request = new XMLHttpRequest();

            request.open('GET', quikSearch.queryParameters.apiUrl);
            request.onload = function() {
                var response = JSON.parse(request.response);
                var pageSize = parseInt(quikSearch.queryParameters.filters.pageSize);
                var pageMax = Math.round(response.length / pageSize);
                var pageButtons = quikSearch.queryParameters.pageButtons;

                typeof response[Symbol.iterator] === 'function' ? quikSearch.response.data = response : quikSearch.response = response;
                
                //If the amount of items returned in the response is greater than the defined page size, create pagination 
                if (quikSearch.response.length > pageSize) {
                    quikSearch.queryParameters.pagination = true;
                    quikSearch.queryParameters.pageButtons = pageMax > pageButtons ? pageButtons : pageMax;
                    quikSearch.queryParameters.pageMax = pageMax;
                }

                //After response is retrieved, create HTML and update settings accordingly
                quikSearch.createHTML(); 
                quikSearch.updateParameters();
                quikSearch.updateFilters();
                quikSearch.updateInput();
                quikSearch.updatePagination();
            };

            request.onreadystatechange = function() {
                if (request.readyState !== 4 && request.status !== 200) {
                    console.log("QuikSearch Error: QuikSearch was unable to retrieve data")
                }
            }
            request.send();
        },

        //JSON from API is stored here
        response: {},

        //Returns child object based on parent object and string notation 
        returnObject: function(object, string, int) {
            var stringArray = string.split('.');
            for (var i = int; i < stringArray.length; i++) {
                object !== undefined ? object = object[stringArray[i]] : console.log("QuikSearch Error: Template values are undefined");
            }
            return object;
        },

        //Triggers search based off keyword(s) and filter(s) and facet(s)
        search: function() {
            var filters = quikSearch.queryParameters.filters;
            var filter = '';
            for (var parameter in filters) {
                filter = filter + parameter + '_' + filters[parameter] + '+';
            }
            window.location.search = 'keyword=' + quikSearch.quikInput.value + '&filters=' + filter.slice(0, -1);
        },

        //Sets facets to QuikSearch - triggers a search
        setFacets: function() {
            var filters = quikSearch.queryParameters.filters;
            var facet = this.dataset.facet;
            var value = this.dataset.value;

            filters[facet] = value;
            quikSearch.search();
        },

        //Saves checked filters to QuikSearch - does NOT apply to active content until a search is triggered
        setFilters: function() {
            var filters = quikSearch.queryParameters.filters;
            var filter = this.dataset.filter;
            var value = this.dataset.value;
            var tracker = this.dataset.filterTracker;

            //Triggers when unchecked checkbox is checked
            if (this.checked) {
                !filters.hasOwnProperty(filter) ? filters[filter] = value : filters[filter] = filters[filter] + '-' + value;
                quikSearch.trackFilter(this, 'create');
            }

            //Triggers when checked checkbox is unchecked
            if (!this.checked || tracker !== undefined) {
                if (filters.hasOwnProperty(filter)) {
                    var preValue = '-' + value;
                    var postValue = value + '-';
                    
                    if (filters[filter].indexOf('-') > 0) {    
                        filters[filter].startsWith(value) ? filters[filter] = filters[filter].replace(postValue, '') : filters[filter] = filters[filter].replace(preValue, '');
                    }
                    else { delete filters[filter] }

                    quikSearch.trackFilter(this, 'remove');
                }
            }
        },

        //Sets amount of items to show based on selected option of select dropdown(s) - triggers a search
        setPagination: function() {
            var filters = quikSearch.queryParameters.filters;
            var option = this.selectedOptions[0];
            var facet = option.dataset.facet;
            var value = option.dataset.value;
            
            filters[facet] = value;
            quikSearch.search();
        },

        //Creates or removes buttons created by checking or unchecking checkbox filters
        trackFilter: function(checkbox, choice) {
            var filter = checkbox.dataset.filter;
            var value = checkbox.dataset.value;
            var filterButton = document.querySelector('[data-filter-tracker=' + value + ']');
            var facet = document.querySelector('[data-filter="' + filter + '"][data-value="' + value + '"]');

            if (choice === 'create') {
                var button = document.createElement('button');
                button.setAttribute('type', 'button');
                button.setAttribute('class', 'quikFilterTrack');
                button.setAttribute('data-filter-tracker', value);
                button.setAttribute('data-filter', filter);
                button.setAttribute('data-value', value);
                button.innerText = filter + ': ' + value;
                button.addEventListener('click', function() {
                    quikSearch.setFilters.bind(this)();
                    facet.checked = false;
                    this.remove();
                });
                quikSearch.quikFilterTrack.appendChild(button);
            }
            if (choice === 'remove' && filterButton !== null) {
                filterButton.remove();
            }
        },

        //Passive function that updates QuikSearch with the filters that have been applied by parsing QuikSearch search query property
        updateFilters: function() {
            if (quikSearch.quikQuery !== undefined) {
                var parameters = quikSearch.quikQuery.split('&');
                for (var parameter in parameters) {
                    var parameterString = parameters[parameter];

                    if (parameterString.indexOf('filters') >= 0) {
                        var filterParameters = parameterString.split('=')[1].split('+');
                        for (var filterParameter in filterParameters) {
                            var filterParameterString = filterParameters[filterParameter];
                            var key = filterParameterString.split('_')[0];
                            var value = filterParameterString.split('_')[1];
                        
                            if (value.indexOf('-') > 0) {
                                var values = value.split('-');
                                for (var filter of values) {
                                    var facet = document.querySelector('[data-filter="' + key + '"][data-value="' + filter + '"]');
                                    if (facet !== null) {
                                        facet.checked = true;
                                        quikSearch.trackFilter(facet, 'create');
                                    }
                                }
                            }
                            else {
                                var facet = document.querySelector('[data-filter="' + key + '"][data-value="' + value + '"]');
                                if (facet !== null) {
                                    facet.checked = true;
                                    quikSearch.trackFilter(facet, 'create');
                                }
                            }
                        }
                    }
                }
            }
        },

        //Passive function that updates QuikSearch search input with the keyword that has been searched
        updateInput: function() {
            quikSearch.quikInput.value = quikSearch.queryParameters.keyword;
        },

        //Passive function that conditionally creates pagination by parsing QuikSearch page parameters
        updatePagination: function() {
            var pageIndex = parseInt(quikSearch.queryParameters.filters.pageIndex);
            var pageMax = parseInt(quikSearch.queryParameters.pageMax);
            var pageSize = quikSearch.queryParameters.filters.pageSize;
            var pageButtons = quikSearch.queryParameters.pageButtons;

            if (quikSearch.queryParameters.pagination) {
                for (var i = 0; quikSearch.quikPagination.length > i; i++) {
                    var pagination = quikSearch.quikPagination[i];

                    //Conditionally creates previous button
                    if (pageIndex !== 0) {
                        var prevButton = document.createElement('button');
                        var prevIndex = pageIndex - 1;
                        prevButton.setAttribute('type', 'button');
                        prevButton.setAttribute('data-facet', 'pageIndex');
                        prevButton.setAttribute('data-value', prevIndex);
                        prevButton.innerText = 'Previous';
                        prevButton.addEventListener('click', quikSearch.setFacets);
                        pagination.appendChild(prevButton);
                    }

                    //Creates pagination buttons
                    for (var a = 0; quikSearch.queryParameters.pageButtons > a; a++) {
                        var buttonIndex;
                        var dataIndex;
                        
                        if (pageIndex <= (pageMax - pageButtons)) {
                            buttonIndex = pageIndex + a + 1;
                            dataIndex = pageIndex + a;
                        } else {
                            buttonIndex = pageMax - (pageButtons - a) + 1;
                            dataIndex = pageMax - (pageButtons - a);
                        }

                        var button = document.createElement('button');
                        button.setAttribute('type', 'button');
                        button.setAttribute('data-facet', 'pageIndex');
                        button.setAttribute('data-value', dataIndex);
                        button.innerText = buttonIndex;
                        button.addEventListener('click', quikSearch.setFacets);
                        
                        if (pageIndex === dataIndex) {
                            button.setAttribute('class', 'active');
                        }
                        pagination.appendChild(button);
                    }

                    //Conditionally creates next button
                    if (pageIndex < (pageMax - 1)) {
                        var nextButton = document.createElement('button');
                        var nextIndex = pageIndex + 1;
                        nextButton.setAttribute('type', 'button');
                        nextButton.setAttribute('data-facet', 'pageIndex');
                        nextButton.setAttribute('data-value', nextIndex);
                        nextButton.innerText = 'Next';
                        nextButton.addEventListener('click', quikSearch.setFacets);
                        pagination.appendChild(nextButton);
                    }
                }
            }

            //Passively updates select dropdown(s) to the appropriate page size option by parsing QuikSearch page size parameter
            for (var i = 0; quikSearch.quikPaginator.length > i; i++) {
                var select = quikSearch.quikPaginator[i];
                for (var item in select.options) {
                    var dataSet = select.options[item].dataset;
                    if (dataSet !== undefined && dataSet.value === pageSize) {
                        select.selectedIndex = parseInt(item);
                    }
                }
            }
        },

        //Passive function that updates QuikSearch with all active search parameters by parsing QuikSearch search query property
        updateParameters: function() {
            if (quikSearch.quikQuery !== undefined) {
                var parameters = quikSearch.quikQuery.split('&');
                var quikObject = {};
                for (var parameter in parameters) {
                    var parameterString = parameters[parameter];

                    if (parameterString.indexOf('keyword') >= 0) {
                        var key = parameterString.split('=')[0];
                        var value = parameterString.split('=')[1];
                        quikObject[key] = value;
                    }

                    if (parameterString.indexOf('filters') >= 0) {
                        quikObject.filters = {};
                        var filterParameters = parameterString.split('=')[1].split('+');
                        
                        for (var filterParameter in filterParameters) {
                            var filterParameterString = filterParameters[filterParameter];
                            var key = filterParameterString.split('_')[0];
                            var value = filterParameterString.split('_')[1];
                            quikObject.filters[key] = value;
                        }
                    }
                }
                Object.assign(quikSearch.queryParameters, quikObject);
            }
        }
    }
    quikSearch.init();
})();