# Obsidian Ribbon Divider

A plugin for Obsidian.MD that allows you to add dividers to the ribbon to space out your icons.

![A screenshot showing dividers on the ribbon interface of Obsidian](dividers_screenshot.png)

## How to Install

Plugin will be added to official repository shortly.

## How to Use

Dividers can be added and removed via the settings screen. Once they are added, you can drag them directly in the ribbon to where you want them just like an icon.

![Settings screens howing where you can add and remove dividers](settings.png)

## Customization

To customize the appearance of the dividers, you can utilize CSS to target the element.

```css
/* Example: Change spacing around diver */
.side-dock-actions .side-dock-ribbon-action.ribbon-divider {
	padding: 8px 0;
}

/* Example: Change width of divider */
.side-dock-actions .side-dock-ribbon-action.ribbon-divider {
	width: 50%;
}

/* Example: Change color of divider */
.side-dock-actions .side-dock-ribbon-action.ribbon-divider &:before {
	background-color: #ff0000;
}
```

If you want to target a _specific_ divider, each divider has a class added that incldues it's unique id (found in settings).

For example, to target a divider with the id `4714cc30-fb33-4da8-857a-a5d6478c9f9a`:

```css
/* Example: Change spacing around a specific diver */
.side-dock-actions
	.side-dock-ribbon-action.ribbon-divider.ribbon-divider-4714cc30-fb33-4da8-857a-a5d6478c9f9a {
	padding: 8px 0;
}
```

## Reporting Issues

If you run into any issues with this plugin, please [open an issue](https://github.com/andrewmcgivery/obsidian-ribbon-divider/issues/new) and incude as much detail as possible, including screenshots.

# Leave a Tip

<a href="https://www.buymeacoffee.com/andrewmcgivery" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>
