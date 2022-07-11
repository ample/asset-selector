/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { FieldExtensionSDK } from "@contentful/app-sdk";
import { createClient } from "contentful-management";
import { /* useCMA, */ useSDK } from "@contentful/react-apps-toolkit";
import {
  createFakeFieldAPI,
  createFakeLocalesAPI,
} from "@contentful/field-editor-test-utils";
import { DropdownEditor } from "@contentful/field-editor-dropdown";
import {
  SkeletonContainer,
  SkeletonDisplayText,
} from "@contentful/f36-components";

const Field = () => {
  const sdk = useSDK<FieldExtensionSDK>();
  const cma = createClient({ apiAdapter: sdk.cmaAdapter });
  const [value, setValue] = useState<string>(sdk.field.getValue());
  const [options, setOptions] = useState<string[]>([]);

  const [field, mitt] = createFakeFieldAPI((mock) => {
    mock.setValue(value);
    return {
      ...mock,
      validations: [{ in: options }],
    };
  });

  useEffect(() => {
    sdk.window.startAutoResizer();
  }, [sdk]);

  useEffect(() => {
    mitt.on("onValueChanged", (e) => {
      sdk.field.setValue(e);
      setValue(e);
    });
  }, [mitt]);

  useEffect(() => {
    const getMedia = async () => {
      const space = await cma.getSpace(sdk.ids.space);
      const environment = await space.getEnvironment(sdk.ids.environment);
      const assets = await environment.getAssets({
        "metadata.tags.sys.id[in]": "animation",
      });
      const opts = assets.items.map(({ fields: { title } }) => title["en-US"]);
      setOptions(opts);
    };
    getMedia();
  }, []);

  return (
    <>
      {options.length === 0 && (
        <SkeletonContainer>
          <SkeletonDisplayText width="100%" />
        </SkeletonContainer>
      )}
      {options.length > 0 && (
        <DropdownEditor
          field={field}
          locales={createFakeLocalesAPI()}
          isInitiallyDisabled={false}
        />
      )}
    </>
  );
};

export default Field;
