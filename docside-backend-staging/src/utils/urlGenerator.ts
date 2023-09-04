import axios from "axios";

export const buildLink = async (type: 'EDIT' | 'CANCEL', appoitmentId: string) => {
    let link = await axios({
      method: 'POST',
      url: `https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=AIzaSyBLjGygInt-PA0AwvhG9yb5T8EQgpavA3g`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        dynamicLinkInfo: {
          domainUriPrefix: 'https://tfacomponent.page.link',
          link: `https://chat.tftcomponents.com/appointment/${appoitmentId}/${type}`,
          androidInfo: {
            androidPackageName: 'com.tft.component.prod',
          },
          iosInfo: {
            iosBundleId: 'com.topflightapps.TFA-Component'
          }
        },
      },
    });
    if (link.status === 200) {
      return link.data.shortLink;
    }
  
    return false;
  };