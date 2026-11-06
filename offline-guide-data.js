(function () {
  "use strict";

  window.AquaVanguardOfflineGuides = {
    unknown: {
      category: "First steps",
      title: "No source you know is safe",
      summary: "Focus first on a safer supply and local advice. Clear-looking water is not proof of safety.",
      image: "assets/offline-guides/water-jerrycans.jpg",
      imageAlt: "Relief workers distributing clean water containers to a community",
      photoTitle: "Distributing buckets and jerrycans in Santo Nino, Leyte",
      photoCreator: "DFID - UK Department for International Development",
      photoSource: "https://live.staticflickr.com/5484/11252683455_79b8e8d286_b.jpg",
      license: "CC BY 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
      warning: "This guide is not a water test. If an authority has issued a do-not-use notice, follow it.",
      translationTips: [
        { key: "whenInDoubt", text: "When in doubt, do not drink it untreated." },
        { key: "contactAuthority", text: "Contact your local health or water authority." }
      ],
      steps: [
        ["Use a confirmed safer supply", "Choose bottled or treated water, or another source confirmed safe by the responsible local authority. Do not assume a new river, well, rain barrel, or clear-looking source is safe."],
        ["Ask what testing is needed", "Contact the local water or public-health authority and describe the source and concern. Ask where and how a sample can be tested."],
        ["Keep safe water separate", "Use clean, food-grade containers with tight-fitting covers. Keep them away from fuel, pesticides, cleaning chemicals, and floodwater."],
        ["Prevent re-contamination", "Pour water or use a clean tap or dedicated clean utensil. Do not dip hands, cups, or used ladles into stored drinking water."],
        ["Keep following local advice", "A change in appearance or smell does not show that the hazard is gone. Resume use of a source only when the responsible authority says it is appropriate."]
      ],
      references: [
        ["WHO: Drinking-water", "https://www.who.int/news-room/fact-sheets/detail/drinking-water"],
        ["CDC: How to Make Water Safe in an Emergency", "https://www.cdc.gov/water-emergency/about/index.html"]
      ]
    },
    flood: {
      category: "Flood or sewage concern",
      title: "Floodwater reached a water source",
      summary: "Floods can damage water systems and carry sewage, chemicals, and other hazards. Keep people away from contaminated water and use local advisories.",
      image: "assets/offline-guides/flooded-street.jpg",
      imageAlt: "Floodwater covering a city street",
      photoTitle: "Vicenza flooding Nov. 1, 2010",
      photoCreator: "US Army Africa",
      photoSource: "https://live.staticflickr.com/1420/5157191333_01fb72ec73_b.jpg",
      license: "CC BY 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
      warning: "Do not enter floodwater to reach, collect, or repair a source. Floodwater may hide electrical, chemical, sewage, and physical hazards.",
      translationTips: [
        { key: "floodGerms", text: "Floodwater can carry germs. Avoid contact and follow local boil advice." }
      ],
      steps: [
        ["Keep people out of floodwater", "Stay clear of flooded wells, streams, pumps, and electrical equipment. Keep children and animals away."],
        ["Pause use of an affected source", "If floodwater entered a well, borehole area, storage tank, or distribution system, use a known safe alternative and ask the local water authority what to do."],
        ["Check which advisory applies", "Follow a boil-water advisory only when authorities say boiling is appropriate. Follow a do-not-use advisory if issued; boiling does not remove fuel or toxic chemicals."],
        ["Protect the alternative supply", "Store drinking water in clean, covered containers and dispense it without dipping hands or used cups into it."],
        ["Report and request testing", "Tell local water or public-health authorities which source flooded and when. Do not return to it based only on clearer water or the flood receding."]
      ],
      references: [
        ["CDC: How to Make Water Safe in an Emergency", "https://www.cdc.gov/water-emergency/about/index.html"],
        ["WHO: Flooding and health", "https://www.who.int/health-topics/floods"]
      ]
    },
    cloudy: {
      category: "Visible particles",
      title: "Cloudy water: settling and cloth pre-filtration only",
      summary: "This is a simple clarification setup for a chosen batch size. It removes some visible particles only. It is not a drinking-water filter or disinfection system.",
      image: "assets/offline-guides/muddy-water.jpg",
      imageAlt: "Satellite image showing muddy sediment spreading into coastal water",
      photoTitle: "Some Tea With Your River, Sir?",
      photoCreator: "NASA Goddard Photo and Video",
      photoSource: "https://live.staticflickr.com/4665/39271889055_609486a9f7_b.jpg",
      license: "CC BY 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
      warning: "If fuel, oil, chemicals, or an unusual sheen may be present, do not handle or try to clarify the water. Use the chemical-spill guide instead.",
      translationTips: [
        { key: "clothSettling", text: "Cloth or settling only removes some visible particles. It does not make water safe to drink." }
      ],
      sizes: {
        "5": {
          name: "Small batch",
          amount: "5 L",
          equipment: ["1 clean, food-grade settling container with a cover, capacity at least 5 L", "1 separate clean, food-grade receiving container, capacity at least 5 L", "A clean cloth or suitable paper filter and a clean way to pour"]
        },
        "20": {
          name: "Household batch",
          amount: "20 L",
          equipment: ["1 clean, food-grade settling container with a cover, capacity at least 20 L", "1 separate clean, food-grade receiving container, capacity at least 20 L", "A clean cloth or suitable paper filter and a clean way to pour"]
        },
        "60": {
          name: "Shared batch",
          amount: "60 L",
          equipment: ["1 clean, food-grade settling container with a cover, capacity at least 60 L", "1 separate clean, food-grade receiving container, capacity at least 60 L", "A clean cloth or suitable paper filter and a clean way to pour; assign one person to handle the clean side"]
        }
      },
      steps: [
        ["Check for a chemical warning first", "Do not proceed if fuel, oil, chemical contamination, or an unusual sheen is suspected. Appearance and smell cannot reliably identify hazards; when unsure, stop and seek local advice."],
        ["Prepare two separate clean containers", "Use the selected capacity for both vessels. Mark one DIRTY / SETTLING and the other CLEAN / CLARIFIED. Do not use any container that held fuel, pesticides, or other chemicals."],
        ["Let particles settle", "Pour the water into the settling vessel, cover it, and leave it undisturbed until visible particles collect at the bottom. No fixed wait time can guarantee that water is safe."],
        ["Pour and strain the clearer layer", "Without disturbing the sediment, slowly pour the clearer upper layer through a clean cloth or suitable paper filter into the second container. Keep the cloth and receiving container clean."],
        ["Stop before drinking", "The clearer water still may contain germs, dissolved chemicals, or other invisible hazards. Follow current local advice for an appropriate validated treatment and testing before drinking."],
        ["Clean up carefully", "Keep settled sludge out of the clean container and source. Clean the equipment after use, and follow local advice for disposing of contaminated sediment."]
      ],
      references: [
        ["CDC: How to Make Water Safe in an Emergency", "https://www.cdc.gov/water-emergency/about/index.html"],
        ["CDC: About Home Water Treatment Systems", "https://www.cdc.gov/drinking-water/about/about-home-water-treatment-systems.html"]
      ]
    },
    chemical: {
      category: "Possible chemical hazard",
      title: "Fuel, oil, or chemical spill",
      summary: "The safest household response is to avoid exposure and find a known safe alternative. No bucket, cloth, sand, charcoal, boiling, or disinfection recipe is offered for this hazard.",
      image: "assets/offline-guides/chemical-spill.jpg",
      imageAlt: "Oil spill response vessels working on contaminated water",
      photoTitle: "Oil Spill",
      photoCreator: "DVIDSHUB",
      photoSource: "https://live.staticflickr.com/4077/4773815181_6732bf673f_b.jpg",
      license: "CC BY 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
      warning: "Do not drink, cook, wash, boil, bleach, filter, or touch water suspected of fuel or toxic chemical contamination. Do not approach a spill to take a photo.",
      translationTips: [
        { key: "chemicalWater", text: "Do not drink or use water that smells like fuel or chemicals." },
        { key: "contactAuthority", text: "Contact your local health or water authority." }
      ],
      steps: [
        ["Stop using the source", "Do not drink it, cook with it, wash with it, or use it for food preparation. Do not test it by tasting or smelling."],
        ["Keep people away", "Avoid contact and keep children and animals away from the water and spill area. Do not enter the water or handle unknown containers."],
        ["Use a known safe alternative", "Get water from a source confirmed safe by the responsible authority. If no alternative is available, contact local emergency, water, or public-health services for urgent advice."],
        ["Report from a safe place", "Share the approximate location, time, and what was observed with the local water or environmental authority. Do not touch, move, or attempt to clean up the substance."],
        ["Wait for authority clearance", "Only the responsible authority can advise on testing, cleanup, and when the source may be used again. A clearer surface is not proof the hazard is gone."]
      ],
      references: [
        ["CDC: Chemical contamination in water emergencies", "https://www.cdc.gov/water-emergency/about/index.html"]
      ]
    },
    shortage: {
      category: "Drought, heat, or shortage",
      title: "Plan when water is running low",
      summary: "El Niño can contribute to climate variability, but this guide does not provide a live forecast. Use local water-service updates and plan around the shortage you are actually experiencing.",
      image: "assets/offline-guides/water-scarcity.jpg",
      imageAlt: "A person collecting water from a dry riverbed",
      photoTitle: "Digging for drinking water in a dry riverbed",
      photoCreator: "DFID - UK Department for International Development",
      photoSource: "https://live.staticflickr.com/6237/6220146368_0a3ae00aab_b.jpg",
      license: "CC BY 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
      warning: "The photo is an example of water scarcity, not a recommendation to collect from an unprotected riverbed. Do not assume a new source is safe.",
      steps: [
        ["Check the local supply plan", "Use local water-service or public-health announcements when available. Ask about collection points, delivery schedules, restrictions, and known safe sources."],
        ["Make a reserve plan", "Use the optional calculator below as a starting estimate only. Heat, illness, pregnancy, infants, pets, cooking, and local guidance may require more."],
        ["Store only known-safe water", "Use clean food-grade containers with covers. Keep stored water away from sunlight, floodwater, fuel, pesticides, and cleaning products."],
        ["Prioritize essential use", "Follow local emergency advice for drinking, food, medicines, and hygiene. Avoid wasting potable water on uses that can safely use non-potable water."],
        ["Do not switch to an unknown source", "Riverbeds, wells, ponds, and harvested rainwater are not automatically safe. Ask authorities which tests or treatments are required before use."]
      ],
      references: [
        ["CDC: Create and store an emergency water supply", "https://www.cdc.gov/water-emergency/about/how-to-create-and-store-an-emergency-water-supply.html"],
        ["WHO: Drought", "https://www.who.int/health-topics/drought"]
      ],
      calculator: true
    },
    storage: {
      category: "Prevent re-contamination",
      title: "Store known-safe water well",
      summary: "A clean, closed container and clean dispensing habits help protect water that is already safe. Storage does not make unsafe water safe.",
      image: "assets/offline-guides/water-jerrycans.jpg",
      imageAlt: "Clean water containers being distributed for household use",
      photoTitle: "Distributing buckets and jerrycans in Santo Nino, Leyte",
      photoCreator: "DFID - UK Department for International Development",
      photoSource: "https://live.staticflickr.com/5484/11252683455_79b8e8d286_b.jpg",
      license: "CC BY 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
      warning: "This protects water from re-contamination; it is not a treatment method. Fill only from a source confirmed safe or treated according to official instructions.",
      steps: [
        ["Choose the right container", "Use a clean food-grade container with a close-fitting lid. Prefer a narrow opening or a tap so hands and cups do not enter the water."],
        ["Reject chemical containers", "Never store drinking water in containers that held fuel, pesticides, solvents, detergents, or other chemicals. Do not use a container if its previous contents are unknown."],
        ["Clean before filling", "Wash the container and lid with safe water and detergent, rinse thoroughly, and follow local public-health advice for sanitizing. Do not guess chemical concentrations."],
        ["Fill from a known-safe source", "Use water confirmed safe by the responsible authority or treated exactly according to its current instructions. Close the lid immediately."],
        ["Label and protect it", "Mark the contents and fill date. Store it away from sunlight, heat, floodwater, and chemicals. Use the oldest supply first and replace it following local guidance."],
        ["Dispense cleanly", "Pour from the container or use its clean tap. If a utensil is necessary, clean it before every use and do not leave it inside the container."]
      ],
      references: [
        ["WHO: Drinking-water", "https://www.who.int/news-room/fact-sheets/detail/drinking-water"],
        ["CDC: Create and store an emergency water supply", "https://www.cdc.gov/water-emergency/about/how-to-create-and-store-an-emergency-water-supply.html"]
      ]
    }
  };
})();
