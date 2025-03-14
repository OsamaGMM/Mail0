import {
  Archive,
  ArchiveX,
  Forward,
  MoreVertical,
  Paperclip,
  Reply,
  ReplyAll,
  BellOff,
  X,
  Send,
  FileIcon,
  Copy,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useForm, SubmitHandler } from "react-hook-form";
import { useState, useEffect, useCallback } from "react";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useThread } from "@/hooks/use-threads";
import { useMail } from "./use-mail";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";

interface MailDisplayProps {
  mail: string | null;
  onClose?: () => void;
  isMobile?: boolean;
}

type FormInputs = {
  replyText: string;
  attachments: File[];
};

export function MailDisplay({ mail, onClose, isMobile }: MailDisplayProps) {
  const [, setMail] = useMail();
  const { data: emailData, isLoading } = useThread(mail ?? "");
  const [isMuted, setIsMuted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    // formState: { errors },
  } = useForm<FormInputs>({
    defaultValues: {
      replyText: "",
      attachments: undefined,
    },
  });

  // Watch form values for visibility control
  const replyText = watch("replyText");
  const attachmentField = watch("attachments");

  const onSubmit: SubmitHandler<FormInputs> = (data) => console.log(data);

  useEffect(() => {
    if (emailData) {
      setIsMuted(emailData.unread ?? false);
    }
  }, [emailData]);

  const handleClose = useCallback(() => {
    onClose?.();
    setMail({ selected: null, bulkSelected: [] });
  }, [onClose, setMail]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [handleClose]);

  const handleAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setIsUploading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const currentFiles = attachmentField;
        const newFiles = currentFiles
          ? [...Array.from(currentFiles), ...Array.from(e.target.files)]
          : Array.from(e.target.files);

        const dataTransfer = new DataTransfer();
        newFiles.forEach((file) => dataTransfer.items.add(file));
        const files = Array.from(dataTransfer.files);
        setValue("attachments", files);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const removeAttachment = (index: number) => {
    const currentFiles = attachmentField;
    if (!currentFiles) return;

    const newFiles = Array.from(currentFiles).filter((_, i) => i !== index);
    const dataTransfer = new DataTransfer();
    newFiles.forEach((file) => dataTransfer.items.add(file));
    const files = Array.from(dataTransfer.files);
    setValue("attachments", files);
  };

  const truncateFileName = (name: string, maxLength = 15) => {
    if (name.length <= maxLength) return name;
    const extIndex = name.lastIndexOf(".");
    if (extIndex !== -1 && name.length - extIndex <= 5) {
      return `${name.slice(0, maxLength - 5)}...${name.slice(extIndex)}`;
    }
    return `${name.slice(0, maxLength)}...`;
  };

  const handleCopy = async () => {
    if (emailData) {
      try {
        await navigator.clipboard.writeText(JSON.stringify(emailData, null, 2));
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  if (!emailData) return <div>Loading...</div>;

  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "flex h-full flex-col transition-all duration-300",
          isMobile ? "" : "rounded-r-lg pt-[6px]",
          isFullscreen ? "fixed inset-0 z-50 bg-background" : "",
        )}
      >
        <div className="sticky top-0 z-20 flex items-center gap-2 border-b bg-background/95 px-4 pb-[7.5px] pt-[0.5px] backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex flex-1 items-center gap-2">
            {!isMobile && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="md:h-fit md:px-2"
                    disabled={!emailData}
                    onClick={handleClose}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Close</TooltipContent>
              </Tooltip>
            )}
            <div className="max-w-[300px] flex-1 truncate text-sm font-medium">
              {emailData.title || "No subject"}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className="md:h-fit md:px-2"
                  disabled={!emailData}
                  onClick={() => setIsFullscreen(!isFullscreen)}
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className="md:h-fit md:px-2"
                  disabled={!emailData}
                  onClick={handleCopy}
                >
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">Copy email data</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{copySuccess ? "Copied!" : "Copy email data"}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" className="md:h-fit md:px-2" disabled={!emailData}>
                  <Archive className="h-4 w-4" />
                  <span className="sr-only">Archive</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Archive</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" className="md:h-fit md:px-2" disabled={!emailData}>
                  <Reply className="h-4 w-4" />
                  <span className="sr-only">Reply</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reply</TooltipContent>
            </Tooltip>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="md:h-fit md:px-2" disabled={!emailData}>
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">More</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <ArchiveX className="mr-2 h-4 w-4" /> Move to spam
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ReplyAll className="mr-2 h-4 w-4" /> Reply all
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Forward className="mr-2 h-4 w-4" /> Forward
                </DropdownMenuItem>
                <DropdownMenuItem>Mark as unread</DropdownMenuItem>
                <DropdownMenuItem>Add label</DropdownMenuItem>
                <DropdownMenuItem>Mute thread</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div
          className={cn(
            "relative flex-1 overflow-hidden bg-background",
            isFullscreen ? "h-[calc(100vh-4rem)]" : "h-[calc(100vh-8rem)]",
          )}
        >
          <div className="h-full overflow-hidden">
            <div className="flex flex-col gap-4 px-4 py-4">
              <div className="flex items-start gap-3">
                <Avatar>
                  <AvatarImage alt={emailData.sender.name} />
                  <AvatarFallback>
                    {emailData.sender.name
                      .split(" ")
                      .map((chunk) => chunk[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="font-semibold">{emailData.sender.name}</div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>{emailData.sender.email}</span>
                    {isMuted && <BellOff className="h-4 w-4" />}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="h-full w-full">
              <div className="flex h-full w-full flex-col">
                {emailData.blobUrl ? (
                  <iframe
                    key={emailData.id}
                    src={emailData.blobUrl}
                    className={cn(
                      "w-full flex-1 border-none transition-opacity duration-200",
                      isLoading ? "opacity-50" : "opacity-100",
                    )}
                    title="Email Content"
                    sandbox="allow-same-origin"
                    style={{
                      height: "calc(100vh - 12rem)",
                      width: "100%",
                      overflow: "auto",
                    }}
                  />
                ) : (
                  <div className="flex h-[calc(100vh-12rem)] w-full items-center justify-center">
                    <div className="h-32 w-32 animate-pulse rounded-full bg-secondary" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="group sticky bottom-0 left-0 right-0 z-50 bg-background">
          <div className="absolute bottom-0 left-0 right-0 flex h-8 cursor-pointer items-center justify-center bg-gradient-to-t from-background to-transparent">
            <div className="flex items-center gap-2 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground">
              <Reply className="h-4 w-4" />
              <span>Reply to email</span>
            </div>
          </div>

          <form
            className={cn(
              "relative mx-4 mb-4 space-y-2.5 rounded-[calc(var(--radius)-2px)] border bg-secondary/50 p-4 shadow-sm transition-all duration-200 ease-in-out",
              replyText === "" && (!attachmentField || attachmentField.length === 0)
                ? "invisible translate-y-16 opacity-0 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100"
                : "visible translate-y-0 opacity-100",
            )}
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Reply className="h-4 w-4" />
                <p className="truncate">
                  {emailData?.sender.name} ({emailData?.sender.email})
                </p>
              </div>
            </div>

            <Textarea
              className="min-h-[60px] w-full resize-none border-0 bg-[#FAFAFA] leading-relaxed placeholder:text-muted-foreground/70 focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-[#18181A] md:text-base"
              placeholder="Write your reply..."
              spellCheck={true}
              {...register("replyText")}
            />

            {((attachmentField && attachmentField.length > 0) || isUploading) && (
              <div className="relative z-50 min-h-[32px]">
                <div className="hide-scrollbar absolute inset-x-0 flex gap-2 overflow-x-auto">
                  {isUploading && (
                    <Badge
                      variant="secondary"
                      className="inline-flex shrink-0 animate-pulse items-center bg-background/50 px-2 py-1.5 text-xs"
                    >
                      Uploading...
                    </Badge>
                  )}
                  {attachmentField &&
                    Array.from(attachmentField).map((file, index) => (
                      <Tooltip key={index}>
                        <TooltipTrigger asChild>
                          <Badge
                            key={index}
                            variant="secondary"
                            className="inline-flex shrink-0 items-center gap-1 bg-background/50 px-2 py-1.5 text-xs"
                          >
                            <span className="max-w-[120px] truncate">
                              {truncateFileName(file.name)}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="ml-1 h-4 w-4 hover:bg-background/80"
                              onClick={(e) => {
                                e.preventDefault();
                                removeAttachment(index);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent className="w-64 p-0">
                          <div className="relative h-32 w-full">
                            {file.type.startsWith("image/") ? (
                              <Image
                                src={URL.createObjectURL(file) || "/placeholder.svg"}
                                alt={file.name}
                                fill
                                className="rounded-t-md object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center p-4">
                                <FileIcon className="h-16 w-16 text-primary" />
                              </div>
                            )}
                          </div>
                          <div className="bg-secondary p-2">
                            <p className="text-sm font-medium">{truncateFileName(file.name, 30)}</p>
                            <p className="text-xs text-muted-foreground">
                              Size: {(file.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Last modified: {new Date(file.lastModified).toLocaleDateString()}
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      className="h-8 w-8 hover:bg-background/80"
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById("attachment-input")?.click();
                      }}
                    >
                      <Paperclip className="h-4 w-4" />
                      <span className="sr-only">Add attachment</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Attach file</TooltipContent>
                </Tooltip>
                <input
                  type="file"
                  className="hidden"
                  id="attachment-input"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                  {...register("attachments", {
                    onChange: handleAttachment,
                  })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-8">
                  Save draft
                </Button>
                <Button size="sm" className="h-8">
                  Send <Send className="ml-2 h-3 w-3" />
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

<style jsx global>{`
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
`}</style>;
