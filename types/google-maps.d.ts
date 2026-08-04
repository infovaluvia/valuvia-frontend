// Minimal ambient types for the slice of the Google Maps JS API (New)
// Places library this project actually uses — avoids depending on the
// full @types/google.maps package for one widget.
declare namespace google.maps {
  function importLibrary(libraryName: string): Promise<unknown>

  namespace places {
    interface PlaceAddressComponent {
      longText: string
      shortText: string
      types: string[]
    }

    interface Place {
      formattedAddress?: string
      addressComponents?: PlaceAddressComponent[]
      fetchFields(options: { fields: string[] }): Promise<{ place: Place }>
    }

    interface PlacePrediction {
      toPlace(): Place
    }

    interface PlaceSelectEvent extends Event {
      placePrediction: PlacePrediction
    }

    interface PlaceAutocompleteElementOptions {
      includedRegionCodes?: string[]
      types?: string[]
    }

    class PlaceAutocompleteElement extends HTMLElement {
      constructor(options?: PlaceAutocompleteElementOptions)
    }
  }
}
