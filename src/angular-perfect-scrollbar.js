angular.module('perfect_scrollbar', []).directive('perfectScrollbar',
  ['$parse', '$window', function($parse, $window) {
  var psOptions = [
    'wheelSpeed', 'wheelPropagation', 'minScrollbarLength', 'useBothWheelAxes',
    'useKeyboard', 'suppressScrollX', 'suppressScrollY', 'scrollXMarginOffset',
    'scrollYMarginOffset', 'includePadding'//, 'onScroll', 'scrollDown'
  ];

  return {
    restrict: 'EA',
    transclude: true,
    template: '<div><div ng-transclude></div></div>',
    replace: true,
    link: function($scope, $elem, $attr) {
      var jqWindow = angular.element($window);
      var options = {};

      for (var i=0, l=psOptions.length; i<l; i++) {
        var opt = psOptions[i];
        if ($attr[opt] !== undefined) {
          options[opt] = $parse($attr[opt])();
        }
      }

      $scope.$evalAsync(function() {
        $elem.perfectScrollbar(options);
        var onScrollHandler = $parse($attr.onScroll)
        $elem.scroll(function(){
          var scrollTop = $elem.scrollTop()
          var scrollHeight = $elem.prop('scrollHeight') - $elem.height()
          $scope.$apply(function() {
            onScrollHandler($scope, {
              scrollTop: scrollTop,
              scrollHeight: scrollHeight
            })
          })
        });
      });

      function update(event) {
        $scope.$evalAsync(function() {
          if ($attr.scrollDown == 'true' && event != 'mouseenter') {
            setTimeout(function () {
              $($elem).scrollTop($($elem).prop("scrollHeight"));
            }, 100);
          }
          $elem.perfectScrollbar('update');
        });
      }

      // This is necessary when you don't watch anything with the scrollbar
      $elem.bind('mouseenter', update('mouseenter'));

      // Possible future improvement - check the type here and use the appropriate watch for non-arrays
      if ($attr.refreshOnChange) {
        $scope.$watchCollection($attr.refreshOnChange, function() {
          update();
        });
      }

      if($attr.alwaysVisible == 'true'){
        $scope.$evalAsync(function() {
          setTimeout(function () {
            $elem.perfectScrollbar('update');
            $elem.find('.ps-scrollbar-x-rail').first().css('opacity', 0.6);
            $elem.find('.ps-scrollbar-y-rail').first().css('opacity', 0.6);
          }, 100);
        });
      }

      if($attr.unbindWheel == 'true'){
        $scope.$evalAsync(function() {
          setTimeout(function () {
            $elem.unbind('mousewheel');
            $elem.unbind('wheel');
          }, 100);
        });
      }

      // this is from a pull request - I am not totally sure what the original issue is but seems harmless
      if ($attr.refreshOnResize) {
        jqWindow.on('resize', update);
      }

      $elem.bind('$destroy', function() {
        jqWindow.off('resize', update);
        $elem.perfectScrollbar('destroy');
      });

    }
  };
}]);
