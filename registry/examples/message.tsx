import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Diamond } from "@/components/ui/diamond";
import { Message, MessageAvatar, MessageContent, MessageFooter, MessageGroup, MessageHeader } from "@/components/ui/message";

export function Preview() {
  return (
    <MessageGroup className="mx-auto w-full max-w-140">
      <Message align="end">
        <MessageAvatar>A</MessageAvatar>
        <MessageContent>
          <MessageHeader>
            You <time dateTime="2026-10-28T16:12">4:12 PM</time>
          </MessageHeader>
          <Bubble align="end">
            <BubbleContent>Check flood risk and terrain for this parcel.</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <Message>
        <MessageAvatar className="bg-inverse text-fg-inverse">
          <Diamond size={14} />
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>
            Mireye <time dateTime="2026-10-28T16:12">4:12 PM</time>
          </MessageHeader>
          <Bubble variant="ghost">
            <BubbleContent>The parcel is in Zone X, outside the 100-year flood plain. It sits at 412 ft with a 2.8% average slope.</BubbleContent>
          </Bubble>
          <MessageFooter>
            <Diamond size={8} variant="outline" /> Cited 3 sources
          </MessageFooter>
        </MessageContent>
      </Message>
    </MessageGroup>
  );
}

export function Replies() {
  return (
    <Message className="mx-auto max-w-140">
      <MessageAvatar>A</MessageAvatar>
      <MessageContent>
        <MessageHeader>
          Acme Energy <time dateTime="2026-10-28T16:20">4:20 PM</time>
        </MessageHeader>
        <Bubble variant="secondary">
          <BubbleContent>Add the Navarro sites to the shortlist too.</BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  );
}
