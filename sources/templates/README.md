#Layout Utility
<p class="docs-intro">
    RawBlock provides a layout system that is responsive, fluid and uses a human readable syntax.
    This is archieved with the use of utility classes. These classes only provide one functionality and are recognizable by the prefix `.use-*` for example `.use-size-50` or `.use-gutters`.
</p>

                    <h2>Sizes</h2>
{{#markdown}}
Rawblock uses 24 width units, who are named `.use-size-%`. Ranging from **5%** to **100%** with **5%** increments.
Additional there are 4 extra classes: `.use-size-16` (16.6666%), `.use-size-33` (33.3333%), `.use-size-66` (66.6666%) and `.use-size-auto` (Takes width content).

The `.use-size-*` classes only define the width of an element. If you want to create vertical columns you can wrap them inside an `.use-column-group` element.

Best practice is to put the `rb-`component always inside an `use-size-*` column. This prevents strange side effect and will be better maintainable for future improvements.
{{/markdown}}
                    <div class="docs-example is-demo">
                        <h3 class="docs-example-title">Demo</h3>

                        <div class="use-column-group">
                            <div class="use-size-40">
                                <div class="docs-item">40%</div>
                            </div>
                            <div class="use-size-40">
                                <div class="docs-item">40%</div>
                            </div>
                            <div class="use-size-20">
                                <div class="docs-item">20%</div>
                            </div>
                        </div>
                    </div>
                    <div class="docs-example">
                        <h3 class="docs-example-title">Code</h3>
{{#markdown}}
    <div class="use-column-group">
        <div class="use-size-40">...</div>
        <div class="use-size-40">...</div>
        <div class="use-size-20">...</div>
    </div>
{{/markdown}}
                    </div>
                    <hr>
{{#markdown}}
##Gutters
Gutters are the space between layout columns. Gutters are set by adding the `use-gutters`
on the parent element of `use-size-*` columns, usualy the `use-column-group`. If you only
want horizontal gutters use `use-gutters-horizontal` and only vertical use `use-gutters-vertical`.

Gutters are only set in conjunction with `use-size-*` as direct children. Nested children are untouched.
{{/markdown}}
                    <div class="docs-example">
                        <h3 class="docs-example-title">Classes</h3>

{{#markdown}}
| Class name | Description
| ------------- |-------------|
| `use-gutters`  | Creates horizontal/vertical space between layout columns. |
|`use-gutters-horizontal`| Creates horizontal space between columns.  |
| `use-gutters-vertical` | Creates vertical (bottom only) space between columns. |
{{/markdown}}
                    </div>
                    <div class="docs-example is-demo">
                        <h3 class="docs-example-title">Demo</h3>

                        <div>
                            <div class="use-column-group use-gutters-horizontal">
                                <div class="use-size-40">
                                    <div class="docs-item">40%</div>
                                </div>
                                <div class="use-size-40">
                                    <div class="docs-item">40%</div>
                                </div>
                                <div class="use-size-20">
                                    <div class="docs-item">20%</div>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div class="docs-example">
                        <h3 class="docs-example-title">Code</h3>

{{#markdown}}
    <div class="use-column-group use-gutters-horizontal">
        <div class="use-size-40">...</div>
        <div class="use-size-40">...</div>
        <div class="use-size-20">...</div>
    </div>
{{/markdown}}

                    </div>
                    <hr>
                    <h2>Breakpoints</h2>
                    <p>
                        RawBlock includes several responsive
                        These names can be created/changed in `$breakpointConfig` and all have an media property where you can set your value.
                        An exception is the `all`. This name defines the layout styles for all screen sizes and therefore has no media property. This name is **required** and
                        may not be changed.
                    </p>

                    <div class="docs-example">
                        <h3 class="docs-example-title">Default Breakpoints</h3>
{{#markdown}}
| name | Description
| ------------- |-------------|
| `all`  | Affects all screen sizes. No suffix is needed. ex. `.use-size-50` (**required**)|
|`l`| Affects screen sizes above 1240px. ex. `.use-size-50-l`  |
| `m` | Affects screen sizes between 569px and 1239px. ex. `.use-size-50-m` |
| `s`| Affects screen sizes up to 568px. ex `.use-size-50-s`  |
{{/markdown}}
                        <p>
                            Next to the property media there are more properties you can set.
                        </p>
                        <h3 class="docs-example-title">Breakpoint Options</h3>
{{#markdown}}
| property name | Description
| ------------- |-------------|
| `media`  | Set values media querie for breakpoint name  |
|`gutter: horizontal / vertical`| Set horizontal/vertical gutter space for `.use-size-*` columns |
{{/markdown}}
                    </div>

                    <div class="docs-example">
                        <h3 class="docs-example-title">Code Example</h3>
{{#markdown}}
    $breakpointConfigs: (
    all: (
    gutter: (
    vertical: 40px,
    horizontal: 40px
    )
    ),
    l: (
    media:'(min-width: 1240px)'
    ),
    m: (
    media:'(min-width: 569px) and (max-width: 1239px)',
    gutter: (
    vertical: 20px,
    horizontal: 20px
    )
    ),
    s: (
    media: '(max-width: 568px)',
    gutter: (
    vertical: 20px,
    horizontal: 20px
    )
    )
    );
{{/markdown}}
                    </div>
                    <hr>