import {
  Bell,
  EllipsisVertical,
  Image as ImageIcon,
  MessageCircle,
  Plus,
  Search,
  Share2,
  Smile,
  ThumbsUp,
  Video,
} from "lucide-react";

type IconProps = {
  className?: string;
};

export function IconSearch({ className }: IconProps) {
  return <Search aria-hidden="true" className={className} />;
}

export function IconBell({ className }: IconProps) {
  return <Bell aria-hidden="true" className={className} />;
}

export function IconMessage({ className }: IconProps) {
  return <MessageCircle aria-hidden="true" className={className} />;
}

export function IconPlus({ className }: IconProps) {
  return <Plus aria-hidden="true" className={className} />;
}

export function IconVideo() {
  return <Video aria-hidden="true" className="h-4 w-4" />;
}

export function IconImage() {
  return <ImageIcon aria-hidden="true" className="h-4 w-4" />;
}

export function IconSmile() {
  return <Smile aria-hidden="true" className="h-4 w-4" />;
}

export function IconLike() {
  return <ThumbsUp aria-hidden="true" className="h-4 w-4" />;
}

export function IconComment() {
  return <MessageCircle aria-hidden="true" className="h-4 w-4" />;
}

export function IconShare() {
  return <Share2 aria-hidden="true" className="h-4 w-4" />;
}

export function IconMoreVertical() {
  return <EllipsisVertical aria-hidden="true" className="h-4 w-4" />;
}
