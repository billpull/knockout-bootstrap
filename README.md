knockout-bootstrap
==================

#### Requires
- knockout
- jQuery ( no minimum version identified yet )
- bootstrap 

A plugin that adds custom bindings for twitter bootstrap objects such as tooltips and popovers.

## Examples

### Tooltips:

TODO: Placement and trigger

```html
<div data-bind="tooltip: 'Tooltip Content'></div>
```

### Popovers:
Popovers reference templates for their content rather
than just strings.

TODO: placements

```html
<button data-bind="popover: {template: 'popoverTemplateID', trigger: 'click'}"></button>
<script type="text/html" id="popoverTemplateID">
  <!-- Insert Popover Content -->
</script>
```
