'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { CompressionOptions as Options } from '@/types';

interface CompressionOptionsProps {
  onCompress: (options: Options) => void;
  disabled?: boolean;
}

export function CompressionOptions({ onCompress, disabled }: CompressionOptionsProps) {
  const [options, setOptions] = useState<Options>({
    resolution: 'original',
    quality: 'medium',
    bitrate: 5000,
    frameRate: 'original',
    audio: 'keep',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCompress(options);
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="resolution">Resolution</Label>
          <Select
            value={options.resolution}
            onValueChange={(value: 'original' | '1080p' | '720p' | '480p' | '360p') => setOptions({ ...options, resolution: value })}
            disabled={disabled}
          >
            <SelectTrigger id="resolution">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="original">Original</SelectItem>
              <SelectItem value="1080p">1080p (1920x1080)</SelectItem>
              <SelectItem value="720p">720p (1280x720)</SelectItem>
              <SelectItem value="480p">480p (854x480)</SelectItem>
              <SelectItem value="360p">360p (640x360)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>Quality Preset</Label>
          <RadioGroup
            value={options.quality}
            onValueChange={(value: 'high' | 'medium' | 'low') => setOptions({ ...options, quality: value })}
            disabled={disabled}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="high" id="high" />
              <Label htmlFor="high" className="font-normal cursor-pointer">
                High (Best quality, larger file)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="medium" id="medium" />
              <Label htmlFor="medium" className="font-normal cursor-pointer">
                Medium (Balanced quality and size)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="low" id="low" />
              <Label htmlFor="low" className="font-normal cursor-pointer">
                Low (Smaller file, lower quality)
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <Label htmlFor="bitrate">Video Bitrate</Label>
            <span className="text-sm text-gray-500">{options.bitrate} kbps</span>
          </div>
          <Slider
            id="bitrate"
            min={500}
            max={10000}
            step={100}
            value={[options.bitrate || 5000]}
            onValueChange={(value) => setOptions({ ...options, bitrate: value[0] })}
            disabled={disabled}
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="frameRate">Frame Rate</Label>
          <Select
            value={options.frameRate}
            onValueChange={(value: 'original' | '60' | '30' | '24') => setOptions({ ...options, frameRate: value })}
            disabled={disabled}
          >
            <SelectTrigger id="frameRate">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="original">Original</SelectItem>
              <SelectItem value="60">60 fps</SelectItem>
              <SelectItem value="30">30 fps</SelectItem>
              <SelectItem value="24">24 fps</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>Audio Options</Label>
          <RadioGroup
            value={options.audio}
            onValueChange={(value: 'keep' | 'remove' | 'reduce') => setOptions({ ...options, audio: value })}
            disabled={disabled}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="keep" id="keep" />
              <Label htmlFor="keep" className="font-normal cursor-pointer">
                Keep audio (192 kbps)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="reduce" id="reduce" />
              <Label htmlFor="reduce" className="font-normal cursor-pointer">
                Reduce audio quality (96 kbps)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="remove" id="remove" />
              <Label htmlFor="remove" className="font-normal cursor-pointer">
                Remove audio
              </Label>
            </div>
          </RadioGroup>
        </div>

        <Button type="submit" className="w-full" disabled={disabled}>
          Start Compression
        </Button>
      </form>
    </Card>
  );
}
