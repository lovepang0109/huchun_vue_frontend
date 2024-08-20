"use client";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import Editor from "@/public/assets/ckeditor/build/ckeditor";
import { useEffect, useState } from "react";

export function CKEditorCustomized({ defaultValue, onChangeCon, config }: any) {
  const [activeEditor, setActiveEditor] = useState<any>();
  const [editorChanged, setEditorChanged] = useState<boolean>(false);
  const ckeditorPreventPaste = (evt: any, data: any) => {
    evt.preventDefault();
  };

  const ckeditorChangeData = (ev: any) => {
    setEditorChanged(true);
  };

  const onReady = (editor: any) => {
    setActiveEditor(editor);
    editor.ui
      .getEditableElement()
      ?.parentElement.insertBefore(
        editor.ui.view.toolbar.element,
        editor.ui.getEditableElement()
      );
    editor.model.document.on("change:data", ckeditorChangeData);
    // editor.ui.focusTracker.on("change:isFocused", ckeditorIsFocused);
    editor.plugins
      .get("ClipboardPipeline")
      .on("inputTransformation", ckeditorPreventPaste);
  };
  useEffect(() => {
    if (activeEditor) {
      activeEditor?.model.document.off("change:data", ckeditorChangeData);
      activeEditor.ui.focusTracker.off("change:data", ckeditorChangeData);
      activeEditor.plugins
        .get("ClipboardPipeline")
        .off("inputTransformation", ckeditorPreventPaste);
    }
  }, []);
  return (
    <CKEditor
      editor={Editor}
      config={config}
      onChange={(event, editor) => {
        const data = editor.getData();
        onChangeCon(data);
      }}
      data={defaultValue}
      onReady={onReady}
    />
  );
}
