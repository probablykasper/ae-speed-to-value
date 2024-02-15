function writeStatus(i, total) {
  clearOutput();
  write('(' + i + '/' + total + ')');
}

function run() {
  var comp = app.project.activeItem;
  if (!comp || !(comp instanceof CompItem)) {
    return alert('Select a property');
  }
  if (comp.selectedProperties.length === 0) {
    return alert('Select a property');
  }

  if (comp.selectedLayers.length === 0) {
    return alert('Select a property');
  }
  if (comp.selectedLayers.length > 1) {
    return alert('Multiple layers are selected');
  }
  var layer = comp.selectedLayers[0];

  var property = null;
  for (var i = 0; i < comp.selectedProperties.length; i++) {
    if (comp.selectedProperties[i] instanceof Property) {
      if (property === null) {
        property = comp.selectedProperties[i];
      } else {
        return alert('You have multiple properties selected');
      }
    }
  }
  if (!property) {
    return alert('Select a property');
  }
  if (typeof property.value !== 'number') {
    return alert('Select a numeric property');
  }

  var times = [comp.workAreaStart];
  var values = [0];

  var secondFrame = comp.workAreaStart + comp.frameDuration;
  var i = 0;
  var totalFrames = comp.workAreaDuration * comp.frameRate;
  var lastWritten = Date.now();
  writeStatus(i + 1, totalFrames);
  for (var time = secondFrame; time < comp.workAreaDuration; time += comp.frameDuration) {
    if (Date.now() > lastWritten + 500) {
      writeStatus(i + 1, totalFrames);
      lastWritten = Date.now();
    }

    // https://ae-scripting.docsforadobe.dev/properties/property.html#property-propertyvaluetype
    if (property.propertyValueType === PropertyValueType.OneD) {
      var accumulatedValue = values[values.length - 1];
      var thisFrameAdd = property.valueAtTime(time, false) * comp.frameDuration;
      times.push(time);
      values.push(accumulatedValue + thisFrameAdd);
    } else {
      return alert('Unsupported property type');
    }

    i++;
  }

  app.beginUndoGroup("Add Accumulated Property");
  var effectsProperty = layer.property('ADBE Effect Parade');
  var slider = effectsProperty.addProperty('ADBE Slider Control');
  slider.name = "Accumulated Value";
  var sliderProperty = slider.property("ADBE Slider Control-0001");
  sliderProperty.setValuesAtTimes(times, values);
  app.endUndoGroup();
  clearOutput();
  // property.name

}
run();
