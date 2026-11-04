"use client";

import * as React from "react";
import { ArrowClockwiseIcon, DownloadSimpleIcon, FileCsvIcon, FilePdfIcon, GlobeHemisphereWestIcon, ImageIcon, XIcon } from "@phosphor-icons/react/ssr";

import { Attachment, AttachmentAction, AttachmentActions, AttachmentContent, AttachmentDescription, AttachmentGroup, AttachmentMedia, AttachmentTitle, AttachmentTrigger } from "@/components/ui/attachment";

export function Preview() {
  const [files, setFiles] = React.useState([
    { name: "site-14-report.pdf", size: "2.4 MB", icon: FilePdfIcon },
    { name: "ellis-parcels.csv", size: "1.2 MB", icon: FileCsvIcon },
    { name: "site-boundary.kml", size: "18 KB", icon: GlobeHemisphereWestIcon },
  ]);
  return (
    <AttachmentGroup className="max-w-full">
      {files.map(({ name, size, icon: Icon }) => (
        <Attachment key={name}>
          <AttachmentTrigger aria-label={`Open ${name}`} />
          <AttachmentMedia>
            <Icon />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{name}</AttachmentTitle>
            <AttachmentDescription>{size}</AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentAction aria-label={`Remove ${name}`} onClick={() => setFiles((all) => all.filter((f) => f.name !== name))}>
              <XIcon />
            </AttachmentAction>
          </AttachmentActions>
        </Attachment>
      ))}
    </AttachmentGroup>
  );
}

export function States() {
  return (
    <div className="flex flex-wrap items-start gap-3">
      <Attachment state="idle">
        <AttachmentMedia>
          <FileCsvIcon />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>buy-box.csv</AttachmentTitle>
          <AttachmentDescription>Waiting</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
      <Attachment state="uploading">
        <AttachmentMedia>
          <FilePdfIcon />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>site-plan.pdf</AttachmentTitle>
          <AttachmentDescription>62% of 4.8 MB</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
      <Attachment state="error">
        <AttachmentMedia>
          <FileCsvIcon />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>navarro-parcels.csv</AttachmentTitle>
          <AttachmentDescription>Larger than 25 MB</AttachmentDescription>
        </AttachmentContent>
        <AttachmentActions>
          <AttachmentAction aria-label="Retry navarro-parcels.csv">
            <ArrowClockwiseIcon />
          </AttachmentAction>
        </AttachmentActions>
      </Attachment>
    </div>
  );
}

export function Vertical() {
  return (
    <div className="flex flex-wrap items-start gap-3">
      <Attachment orientation="vertical">
        <AttachmentMedia variant="image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/examples/farmland-aerial.jpg" alt="" />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>aerial-site-14.jpg</AttachmentTitle>
          <AttachmentDescription>164 KB</AttachmentDescription>
        </AttachmentContent>
        <AttachmentActions>
          <AttachmentAction aria-label="Download aerial-site-14.jpg">
            <DownloadSimpleIcon />
          </AttachmentAction>
        </AttachmentActions>
      </Attachment>
      <Attachment orientation="vertical" state="processing">
        <AttachmentMedia>
          <ImageIcon />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>survey-scan.png</AttachmentTitle>
          <AttachmentDescription>Reading</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
    </div>
  );
}

export function Sizes() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {(["default", "sm", "xs"] as const).map((size) => (
        <Attachment key={size} size={size}>
          <AttachmentMedia>
            <FilePdfIcon />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>site-14-report.pdf</AttachmentTitle>
            <AttachmentDescription>2.4 MB</AttachmentDescription>
          </AttachmentContent>
        </Attachment>
      ))}
    </div>
  );
}
