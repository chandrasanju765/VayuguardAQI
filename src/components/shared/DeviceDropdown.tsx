import { useMemo } from "react";
import { Dropdown } from "../ui/dropdown";
import { useGetAQIDevices } from "../../data/cachedQueries";
import { useAtom } from "jotai";
import { selectedDeviceAtom } from "../../atoms/selectedDevice";
import type { AQIDevice } from "../../models/AQIDevices";

type Option = { label: string; value: string };

type Props = {
  options?: Option[];
  value?: string | null;
  onChange?: (v: string) => void;
  defaultValue?: string | null;
  triggerClassName?: string;
  contentClassName?: string;
  placeholder?: string;
};

const DeviceDropdown = ({
  options,
  value,
  onChange,
  defaultValue,
  triggerClassName,
  contentClassName,
  placeholder = "Select Device",
}: Props) => {
  const { data: devicesData } = useGetAQIDevices();
  const devicesRaw = (devicesData as any) || [];
  const devices: AQIDevice[] = Array.isArray(devicesRaw)
    ? devicesRaw
    : Array.isArray(devicesRaw?.data)
    ? (devicesRaw.data as AQIDevice[])
    : [];

  const deviceOptions: Option[] = useMemo(() => {
    if (options && options.length) return options;
    return devices.map((d) => ({
      label: d.deviceId,
      value: d.deviceId,
    }));
  }, [options, devices]);

  const renderOptions: Option[] = deviceOptions;

  const [selectedAQIDevice, setSelectedAQIDevice] = useAtom(selectedDeviceAtom);

  const currentDefault =
    value !== undefined
      ? value || ""
      : selectedAQIDevice?.deviceId || defaultValue || "";

  const handleChange = (v: string) => {
    if (onChange) {
      onChange(v);
      return;
    }
    const selectedDevice = devices.find((device) => device.deviceId === v);
    setSelectedAQIDevice(selectedDevice || null);
  };

  return (
    <Dropdown
      options={renderOptions}
      defaultValue={currentDefault}
      onValueChange={(v: string) => handleChange(v)}
      triggerClassName={triggerClassName}
      contentClassName={contentClassName}
      placeholder={placeholder}
    />
  );
};

export default DeviceDropdown;
