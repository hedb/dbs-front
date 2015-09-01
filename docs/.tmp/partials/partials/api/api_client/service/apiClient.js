(function(module) {
try {
  module = angular.module('docApp');
} catch (e) {
  module = angular.module('docApp', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('partials/api/api_client/service/apiClient.html',
    '<header class="api-profile-header"><h1 class="api-profile-header-heading">apiClient</h1><ol class="api-profile-header-structure naked-list step-list"><li>- service in module <a href=""></a></li></ol></header><div class="api-profile-description"><p>Provides access to API endpoints.</p></div><div><h2 id="dependencies">Dependencies</h2><ul><li><a href="api/config/service/apiConfig"><code>apiConfig</code></a></li></ul><h2>Properties</h2><ul class="properties"><li id="base_url"><h3><code>base_url</code></h3><table class="variables-matrix return-arguments"><tr><td><a href="" class="label type-hint type-hint-string">String</a></td><td><p>The base URL for the BHS API.</p></td></tr></table></li><li id="endpoints"><h3><code>endpoints</code></h3><table class="variables-matrix return-arguments"><tr><td><a href="" class="label type-hint type-hint-object">Object</a></td><td><p>Maps endpoint names to values from <a href="api/config/service/apiConfig"><code>apiConfig</code></a>.</p></td></tr></table></li><li id="urls"><h3><code>urls</code></h3><table class="variables-matrix return-arguments"><tr><td><a href="" class="label type-hint type-hint-object">Object</a></td><td><p>An object that maps API endpoint names to full endpoint URLs.</p></td></tr></table></li></ul></div>');
}]);
})();